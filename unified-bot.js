/**
 * Bot Unificado - Servidores 1 e 2
 * 
 * Combina a automação para:
 * - Servidor 1: TropicalPlayTV (https://painel.tropicalplaytv.com)
 * - Servidor 2: SpiderTV (https://spidertv.sigma.st)
 *
 * .env:
 *   # Servidor 1
 *   BASE_URL=https://painel.tropicalplaytv.com
 *   SERVER1_USER=Eider Goncalves
 *   SERVER1_PASS=Goncalves1
 *   
 *   # Servidor 2
 *   SERVER2_BASE_URL=https://spidertv.sigma.st
 *   SERVER2_USER=tropicalplay
 *   SERVER2_PASS=Virginia13
 *   
 *   PORT=8080
 *
 * Como rodar:
 *   npm install
 *   npx playwright install --with-deps
 *   node unified-bot.js
 *
 * Endpoints:
 *   GET  /health - Status geral
 *   GET  /health/server1 - Status Servidor 1
 *   GET  /health/server2 - Status Servidor 2
 *   POST /activate/server1 - Renovar no TropicalPlayTV
 *   POST /activate/server2 - Renovar no SpiderTV
 *   POST /activate/both - Renovar em ambos servidores
 */

import 'dotenv/config';
import express from 'express';
import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// --------------------------- Configurações ---------------------------

const PORT = Number(process.env.PORT || 8080);

// Servidor 1 (TropicalPlayTV)
const SERVER1_CONFIG = {
  baseUrl: (process.env.BASE_URL || 'https://painel.tropicalplaytv.com').replace(/\/+$/,''),
  username: process.env.SERVER1_USER || '',
  password: process.env.SERVER1_PASS || '',
  cookiePath: path.resolve(__dirname, 'server1_session.json')
};

// Servidor 2 (SpiderTV)
const SERVER2_CONFIG = {
  baseUrl: (process.env.SERVER2_BASE_URL || 'https://spidertv.sigma.st').replace(/\/+$/,''),
  username: process.env.SERVER2_USER || 'tropicalplay',
  password: process.env.SERVER2_PASS || 'Virginia13',
  cookiePath: path.resolve(__dirname, 'server2_session.json')
};

const DEFAULT_HEADLESS = process.env.NODE_ENV === 'production';

// --------------------------- Utilitários ---------------------------

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
async function ensureDir(p) { try { await fs.mkdir(p, { recursive: true }); } catch {} }

async function takeScreenshot(page, name) {
  try {
    const tmp = path.resolve(__dirname, 'tmp');
    await ensureDir(tmp);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ path: path.join(tmp, `${name}-${ts}.png`), fullPage: true });
  } catch {}
}

// --------------------------- Servidor 1 (TropicalPlayTV) ---------------------------

class Server1Bot {
  async loadSession() {
    try {
      const raw = await fs.readFile(SERVER1_CONFIG.cookiePath, 'utf-8');
      const json = JSON.parse(raw);
      return json?.PHPSESSID || null;
    } catch {
      return null;
    }
  }

  async saveSession(phpsessid) {
    await fs.writeFile(SERVER1_CONFIG.cookiePath, JSON.stringify({ PHPSESSID: phpsessid }, null, 2));
  }

  async testSession(phpsessid) {
    try {
      const url = `${SERVER1_CONFIG.baseUrl}/sys/api.php?action=get_clients&draw=1&start=0&length=1&search[value]=`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': `${SERVER1_CONFIG.baseUrl}/iptv/clients`,
          'Cookie': `PHPSESSID=${phpsessid}`
        }
      });
      const contentType = res.headers.get('content-type') || '';
      return contentType.includes('application/json');
    } catch {
      return false;
    }
  }

  async login() {
    const browser = await chromium.launch({ headless: DEFAULT_HEADLESS });
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(20000);

    try {
      console.log('🔐 [Servidor 1] Fazendo login...');
      
      await page.goto(`${SERVER1_CONFIG.baseUrl}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);

      const needsLogin = await page.$('input[type="password"]') || await page.$('button:has-text("Login"), button:has-text("Entrar")');
      
      if (needsLogin) {
        const userInput = await page.$('#username');
        const passInput = await page.$('#password');
        if (!userInput || !passInput) throw new Error('Campos de login não encontrados');

        await userInput.fill(SERVER1_CONFIG.username);
        await passInput.fill(SERVER1_CONFIG.password);

        const loginBtn = await page.$('#button-login');
        if (!loginBtn) throw new Error('Botão de login não encontrado');
        await loginBtn.click();

        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1200);
      }

      await page.goto(`${SERVER1_CONFIG.baseUrl}/iptv/clients`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);

      const cookies = await context.cookies(SERVER1_CONFIG.baseUrl);
      const sess = cookies.find(c => c.name === 'PHPSESSID');
      if (!sess?.value) {
        await takeScreenshot(page, 'server1-login-error');
        throw new Error('Não foi possível obter PHPSESSID após login');
      }

      await browser.close();
      return sess.value;
    } catch (err) {
      await takeScreenshot(page, 'server1-login-fail');
      await browser.close();
      throw err;
    }
  }

  async getValidSession() {
    let sid = await this.loadSession();
    if (sid && await this.testSession(sid)) return sid;

    sid = await this.login();
    await this.saveSession(sid);

    if (!(await this.testSession(sid))) {
      throw new Error('Sessão obtida no login parece inválida');
    }
    return sid;
  }

  async renewClient(code, months = 1) {
    const phpsessid = await this.getValidSession();
    
    // Tenta renovar via API
    const url = `${SERVER1_CONFIG.baseUrl}/sys/api.php?action=renew_client_plus&client_id=${code}&months=${months}`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `${SERVER1_CONFIG.baseUrl}/iptv/clients`,
        'Cookie': `PHPSESSID=${phpsessid}`
      }
    });

    const data = await res.json();
    const success = data?.status?.toLowerCase?.() === 'success' || data?.success === true;

    if (!success) {
      throw new Error(`Falha na renovação: ${JSON.stringify(data)}`);
    }

    return { success: true, clientId: code, months, response: data };
  }
}

// --------------------------- Servidor 2 (SpiderTV) ---------------------------

class Server2Bot {
  async loadSession() {
    try {
      const raw = await fs.readFile(SERVER2_CONFIG.cookiePath, 'utf-8');
      const json = JSON.parse(raw);
      return json?.cookies || null;
    } catch {
      return null;
    }
  }

  async saveSession(cookies) {
    await fs.writeFile(SERVER2_CONFIG.cookiePath, JSON.stringify({ cookies }, null, 2));
  }

  async testSession(cookies) {
    try {
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      await context.addCookies(cookies);
      const page = await context.newPage();
      
      await page.goto(`${SERVER2_CONFIG.baseUrl}/#/clients`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const isValid = page.url().includes('clients') || await page.$('text=Clientes');
      
      await browser.close();
      return isValid;
    } catch {
      return false;
    }
  }

  async login() {
    const browser = await chromium.launch({ headless: DEFAULT_HEADLESS });
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(20000);

    try {
      console.log('🔐 [Servidor 2] Fazendo login...');
      
      await page.goto(`${SERVER2_CONFIG.baseUrl}/#/sign-in`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Preenche usuário
      const userInput = await page.$('input[placeholder*="Username" i], input[placeholder*="Email" i]') || 
                        (await page.$$('input[type="text"], input[type="email"]'))[0];
      if (!userInput) throw new Error('Campo de usuário não encontrado');
      await userInput.fill(SERVER2_CONFIG.username);

      // Preenche senha
      const passInput = await page.$('input[type="password"]');
      if (!passInput) throw new Error('Campo de senha não encontrado');
      await passInput.fill(SERVER2_CONFIG.password);

      // Clica em login
      const loginBtn = await page.$('button:has-text("Continue"), button:has-text("Login"), button:has-text("Entrar")');
      if (!loginBtn) throw new Error('Botão de login não encontrado');
      await loginBtn.click();

      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);

      // Fecha modal se aparecer
      const modalOk = await page.$('button:has-text("OK")');
      if (modalOk) {
        await modalOk.click();
        await page.waitForTimeout(1000);
      }

      // Verifica login
      const currentUrl = page.url();
      if (!currentUrl.includes('dashboard') && !currentUrl.includes('clients')) {
        throw new Error('Login falhou - não redirecionou para dashboard');
      }

      const cookies = await context.cookies();
      await browser.close();
      return cookies;

    } catch (err) {
      await takeScreenshot(page, 'server2-login-fail');
      await browser.close();
      throw err;
    }
  }

  async getValidSession() {
    let cookies = await this.loadSession();
    if (cookies && await this.testSession(cookies)) return cookies;

    cookies = await this.login();
    await this.saveSession(cookies);

    if (!(await this.testSession(cookies))) {
      throw new Error('Sessão obtida no login parece inválida');
    }
    return cookies;
  }

  async renewClient(code, months = 1) {
    const cookies = await this.getValidSession();
    
    const browser = await chromium.launch({ headless: DEFAULT_HEADLESS });
    const context = await browser.newContext();
    await context.addCookies(cookies);
    const page = await context.newPage();
    page.setDefaultTimeout(20000);

    try {
      console.log(`🔄 [Servidor 2] Renovando cliente ${code}...`);
      
      await page.goto(`${SERVER2_CONFIG.baseUrl}/#/clients`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Fecha modal se aparecer
      const modalOk = await page.$('button:has-text("OK")');
      if (modalOk) {
        await modalOk.click();
        await page.waitForTimeout(1000);
      }

      // Busca cliente
      const searchInput = await page.$('input[placeholder*="Pesquisar" i], input[type="search"]') ||
                          (await page.$$('input[type="text"]'))[0];
      if (searchInput) {
        await searchInput.fill(String(code));
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
      }

      // Procura botão de renovação
      const renewBtn = await page.$(`tr:has-text("${code}") button[title*="Renovar" i], tr:has-text("${code}") .btn-success, tr:has-text("${code}") button:has-text("+")`);
      
      if (!renewBtn) {
        throw new Error('Botão de renovação não encontrado para este cliente');
      }

      await renewBtn.click();
      await page.waitForTimeout(2000);

      // Configura meses se houver campo
      const monthsSelect = await page.$('select, input[type="number"]');
      if (monthsSelect) {
        await monthsSelect.fill(String(months));
      }

      // Confirma renovação
      const confirmBtn = await page.$('button:has-text("Confirmar"), button:has-text("Renovar"), button:has-text("OK")');
      if (confirmBtn) {
        await confirmBtn.click();
        await page.waitForTimeout(2000);
      }

      await browser.close();
      return { success: true, clientId: code, months };

    } catch (err) {
      await takeScreenshot(page, 'server2-renew-fail');
      await browser.close();
      throw err;
    }
  }
}

// --------------------------- API HTTP ---------------------------

const app = express();
app.use(express.json({ limit: '2mb' }));

const server1Bot = new Server1Bot();
const server2Bot = new Server2Bot();

// Health checks
app.get('/health', async (_req, res) => {
  const server1Session = await server1Bot.loadSession();
  const server2Session = await server2Bot.loadSession();
  
  res.json({
    status: 'ok',
    servers: {
      server1: {
        name: 'TropicalPlayTV',
        url: SERVER1_CONFIG.baseUrl,
        hasSession: !!server1Session
      },
      server2: {
        name: 'SpiderTV',
        url: SERVER2_CONFIG.baseUrl,
        hasSession: !!server2Session
      }
    }
  });
});

app.get('/health/server1', async (_req, res) => {
  const session = await server1Bot.loadSession();
  res.json({
    status: 'ok',
    server: 'TropicalPlayTV (Servidor 1)',
    base: SERVER1_CONFIG.baseUrl,
    hasSessionSaved: !!session
  });
});

app.get('/health/server2', async (_req, res) => {
  const session = await server2Bot.loadSession();
  res.json({
    status: 'ok',
    server: 'SpiderTV (Servidor 2)',
    base: SERVER2_CONFIG.baseUrl,
    hasSessionSaved: !!session
  });
});

// Renovação individual
app.post('/activate/server1', async (req, res) => {
  try {
    const { code, months = 1 } = req.body || {};
    if (!code) return res.status(400).json({ ok: false, error: 'code é obrigatório' });

    const result = await server1Bot.renewClient(code, Number(months) || 1);
    return res.json({ ok: true, server: 'server1', ...result });
  } catch (err) {
    return res.status(500).json({ ok: false, server: 'server1', error: String(err) });
  }
});

app.post('/activate/server2', async (req, res) => {
  try {
    const { code, months = 1 } = req.body || {};
    if (!code) return res.status(400).json({ ok: false, error: 'code é obrigatório' });

    const result = await server2Bot.renewClient(code, Number(months) || 1);
    return res.json({ ok: true, server: 'server2', ...result });
  } catch (err) {
    return res.status(500).json({ ok: false, server: 'server2', error: String(err) });
  }
});

// Renovação em ambos servidores
app.post('/activate/both', async (req, res) => {
  try {
    const { code, months = 1 } = req.body || {};
    if (!code) return res.status(400).json({ ok: false, error: 'code é obrigatório' });

    const results = {
      server1: null,
      server2: null,
      errors: []
    };

    // Tenta renovar no Servidor 1
    try {
      results.server1 = await server1Bot.renewClient(code, Number(months) || 1);
    } catch (err) {
      results.errors.push({ server: 'server1', error: String(err) });
    }

    // Tenta renovar no Servidor 2
    try {
      results.server2 = await server2Bot.renewClient(code, Number(months) || 1);
    } catch (err) {
      results.errors.push({ server: 'server2', error: String(err) });
    }

    const hasSuccess = results.server1?.success || results.server2?.success;
    const status = hasSuccess ? 200 : 500;

    return res.status(status).json({
      ok: hasSuccess,
      code,
      months: Number(months) || 1,
      results,
      summary: {
        server1: results.server1?.success ? 'success' : 'failed',
        server2: results.server2?.success ? 'success' : 'failed',
        totalErrors: results.errors.length
      }
    });

  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Bot Unificado rodando em http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   GET  /health - Status geral`);
  console.log(`   GET  /health/server1 - Status TropicalPlayTV`);
  console.log(`   GET  /health/server2 - Status SpiderTV`);
  console.log(`   POST /activate/server1 - Renovar no TropicalPlayTV`);
  console.log(`   POST /activate/server2 - Renovar no SpiderTV`);
  console.log(`   POST /activate/both - Renovar em ambos servidores`);
  console.log(`\n🔧 Servidores configurados:`);
  console.log(`   Servidor 1: ${SERVER1_CONFIG.baseUrl}`);
  console.log(`   Servidor 2: ${SERVER2_CONFIG.baseUrl}`);
});
