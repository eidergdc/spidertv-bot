/**
 * Renovação automática — Servidor 2 (SpiderTV)
 *
 * Fluxo:
 * 1) Faz login no painel SpiderTV (interface moderna)
 * 2) Navega para página de clientes
 * 3) Busca cliente pelo ID/código
 * 4) Executa renovação via interface ou API
 *
 * .env:
 *   SERVER2_BASE_URL=https://spidertv.sigma.st
 *   SERVER2_USER=tropicalplay
 *   SERVER2_PASS=Virginia13
 *   PORT=8080
 *
 * Como rodar:
 *   npm install
 *   npx playwright install --with-deps
 *   node server2.js
 *
 * Teste:
 *   curl http://localhost:8080/health/server2
 *   curl -X POST http://localhost:8080/activate/server2 \
 *     -H "Content-Type: application/json" \
 *     -d '{"code":"155357738","months":1}'
 */

import 'dotenv/config';
import express from 'express';
import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// --------------------------- ENV & Normalização ---------------------------

const RAW_BASE = (process.env.SERVER2_BASE_URL || 'https://spidertv.sigma.st').replace(/\/+$/,'');
const ORIGIN   = new URL(RAW_BASE).origin;
const USERNAME = process.env.SERVER2_USER || 'tropicalplay';
const PASSWORD = process.env.SERVER2_PASS || 'Virginia13';
const PORT     = Number(process.env.PORT || 8081);

// Arquivos auxiliares
const COOKIE_PATH = path.resolve(__dirname, 'server2_session.json');
const DEFAULT_HEADLESS = true;

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
async function ensureDir(p){ try{ await fs.mkdir(p, { recursive:true }); } catch{} }

// --------------------------- Sessão / Login ---------------------------

async function loadSavedSession() {
  try {
    const raw = await fs.readFile(COOKIE_PATH, 'utf-8');
    const json = JSON.parse(raw);
    if (json && json.cookies) return json.cookies;
  } catch {}
  return null;
}

async function saveSession(cookies) {
  await fs.writeFile(COOKIE_PATH, JSON.stringify({ cookies }, null, 2));
}

/**
 * Faz login no SpiderTV e retorna os cookies da sessão
 */
async function loginAndGetCookies() {
  if (!USERNAME || !PASSWORD) {
    throw new Error('SERVER2_USER e SERVER2_PASS precisam estar definidos no .env');
  }

  const browser = await chromium.launch({ headless: DEFAULT_HEADLESS });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  try {
    console.log('🔐 Fazendo login no SpiderTV...');
    
    // Vai para a página de login
    await page.goto(`${ORIGIN}/#/sign-in`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Preenche o campo de usuário
    const userInput = await page.$('input[placeholder*="Username" i], input[placeholder*="Email" i]');
    if (!userInput) {
      // Tenta seletores alternativos
      const inputs = await page.$$('input[type="text"], input[type="email"]');
      if (inputs.length > 0) {
        await inputs[0].fill(USERNAME);
      } else {
        throw new Error('Campo de usuário não encontrado');
      }
    } else {
      await userInput.fill(USERNAME);
    }

    // Preenche o campo de senha
    const passInput = await page.$('input[type="password"]');
    if (!passInput) throw new Error('Campo de senha não encontrado');
    await passInput.fill(PASSWORD);

    // Clica no botão de login
    const loginBtn = await page.$('button:has-text("Continue"), button:has-text("Login"), button:has-text("Entrar")');
    if (!loginBtn) throw new Error('Botão de login não encontrado');
    await loginBtn.click();

    // Aguarda redirecionamento
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Verifica se há modal de aviso e fecha
    const modalOk = await page.$('button:has-text("OK")');
    if (modalOk) {
      await modalOk.click();
      await page.waitForTimeout(1000);
    }

    // Verifica se o login foi bem-sucedido
    const currentUrl = page.url();
    if (!currentUrl.includes('dashboard') && !currentUrl.includes('clients')) {
      throw new Error('Login falhou - não redirecionou para dashboard');
    }

    console.log('✅ Login realizado com sucesso!');

    // Obtém todos os cookies
    const cookies = await context.cookies();
    await browser.close();
    return cookies;

  } catch (err) {
    try {
      const tmp = path.resolve(__dirname, 'tmp');
      await ensureDir(tmp);
      const ts = new Date().toISOString().replace(/[:.]/g,'-');
      await page.screenshot({ path: path.join(tmp, `server2-login-fail-${ts}.png`), fullPage: true });
    } catch {}
    await browser.close();
    throw err;
  }
}

/**
 * Retorna cookies utilizáveis para o SpiderTV
 */
async function getValidCookies() {
  let cookies = await loadSavedSession();
  if (cookies && await testSession(cookies)) return cookies;

  // Se inválido, re-login
  cookies = await loginAndGetCookies();
  await saveSession(cookies);

  // Valida só por garantia
  if (!(await testSession(cookies))) {
    throw new Error('Sessão obtida no login parece inválida.');
  }
  return cookies;
}

/**
 * Testa se os cookies ainda são válidos
 */
async function testSession(cookies) {
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(cookies);
    const page = await context.newPage();
    
    await page.goto(`${ORIGIN}/#/clients`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Se conseguir acessar a página de clientes, a sessão é válida
    const isValid = page.url().includes('clients') || await page.$('text=Clientes');
    
    await browser.close();
    return isValid;
  } catch {
    return false;
  }
}

// --------------------------- Operações de Cliente ---------------------------

/**
 * Busca um cliente pelo código/ID
 */
async function findClientByCode(code, cookies) {
  const browser = await chromium.launch({ headless: DEFAULT_HEADLESS });
  const context = await browser.newContext();
  await context.addCookies(cookies);
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  try {
    console.log(`🔍 Buscando cliente: ${code}`);
    
    // Vai para página de clientes
    await page.goto(`${ORIGIN}/#/clients`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Fecha modal se aparecer
    const modalOk = await page.$('button:has-text("OK")');
    if (modalOk) {
      await modalOk.click();
      await page.waitForTimeout(1000);
    }

    // Busca o campo de pesquisa
    const searchInput = await page.$('input[placeholder*="Pesquisar" i], input[type="search"]');
    if (!searchInput) {
      // Tenta seletores alternativos
      const inputs = await page.$$('input[type="text"]');
      if (inputs.length > 0) {
        await inputs[0].fill(String(code));
      } else {
        throw new Error('Campo de pesquisa não encontrado');
      }
    } else {
      await searchInput.fill(String(code));
    }

    // Pressiona Enter ou aguarda busca automática
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Procura o cliente na tabela
    const clientRow = await page.$(`text=${code}`);
    if (!clientRow) {
      await browser.close();
      return null;
    }

    console.log('✅ Cliente encontrado!');
    await browser.close();
    return { id: code, found: true };

  } catch (err) {
    try {
      const tmp = path.resolve(__dirname, 'tmp');
      await ensureDir(tmp);
      const ts = new Date().toISOString().replace(/[:.]/g,'-');
      await page.screenshot({ path: path.join(tmp, `server2-search-${ts}.png`), fullPage: true });
    } catch {}
    await browser.close();
    throw err;
  }
}

/**
 * Renova um cliente
 */
async function renewClient(code, months, cookies) {
  const browser = await chromium.launch({ headless: DEFAULT_HEADLESS });
  const context = await browser.newContext();
  await context.addCookies(cookies);
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  try {
    console.log(`🔄 Renovando cliente ${code} por ${months} mês(es)...`);
    
    // Vai para página de clientes
    await page.goto(`${ORIGIN}/#/clients`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Fecha modal se aparecer
    const modalOk = await page.$('button:has-text("OK")');
    if (modalOk) {
      await modalOk.click();
      await page.waitForTimeout(1000);
    }

    // Busca o cliente
    const searchInput = await page.$('input[placeholder*="Pesquisar" i], input[type="search"]');
    if (searchInput) {
      await searchInput.fill(String(code));
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
    }

    // Procura o botão de renovação (geralmente um botão verde ou com ícone de renovar)
    const renewBtn = await page.$(`tr:has-text("${code}") button[title*="Renovar" i], tr:has-text("${code}") .btn-success, tr:has-text("${code}") button:has-text("+")`);
    
    if (!renewBtn) {
      throw new Error('Botão de renovação não encontrado para este cliente');
    }

    await renewBtn.click();
    await page.waitForTimeout(2000);

    // Aqui pode aparecer um modal para selecionar o período
    // Vamos tentar encontrar e configurar
    const monthsSelect = await page.$('select, input[type="number"]');
    if (monthsSelect) {
      await monthsSelect.fill(String(months));
    }

    // Confirma a renovação
    const confirmBtn = await page.$('button:has-text("Confirmar"), button:has-text("Renovar"), button:has-text("OK")');
    if (confirmBtn) {
      await confirmBtn.click();
      await page.waitForTimeout(2000);
    }

    console.log('✅ Renovação executada!');
    await browser.close();
    return { success: true, clientId: code, months };

  } catch (err) {
    try {
      const tmp = path.resolve(__dirname, 'tmp');
      await ensureDir(tmp);
      const ts = new Date().toISOString().replace(/[:.]/g,'-');
      await page.screenshot({ path: path.join(tmp, `server2-renew-${ts}.png`), fullPage: true });
    } catch {}
    await browser.close();
    throw err;
  }
}

// --------------------------- Fluxo principal ---------------------------

/**
 * Função principal de renovação para o Servidor 2
 */
async function renewServer2({ code, months = 1 }) {
  // Obtém cookies válidos
  let cookies = await getValidCookies();

  // Busca o cliente
  let client = await findClientByCode(code, cookies);
  if (!client) {
    // Tenta re-login se não encontrou
    cookies = await loginAndGetCookies();
    await saveSession(cookies);
    client = await findClientByCode(code, cookies);
    if (!client) throw new Error(`Cliente não encontrado para o código "${code}".`);
  }

  // Renova o cliente
  let result = await renewClient(code, months, cookies);
  if (!result.success) {
    // Fallback: re-login e tenta novamente
    cookies = await loginAndGetCookies();
    await saveSession(cookies);
    result = await renewClient(code, months, cookies);
  }

  if (!result.success) {
    throw new Error(`Falha na renovação do cliente ${code}`);
  }

  return { ok: true, clientId: code, months, response: result };
}

// --------------------------- API HTTP ---------------------------

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/health/server2', async (_req, res) => {
  const cookies = await loadSavedSession();
  res.json({
    status: 'ok',
    server: 'SpiderTV (Servidor 2)',
    base: ORIGIN,
    hasSessionSaved: !!cookies
  });
});

app.post('/activate/server2', async (req, res) => {
  try {
    const { code, months = 1 } = req.body || {};
    if (!code) return res.status(400).json({ ok: false, error: 'code é obrigatório' });

    const out = await renewServer2({ code, months: Number(months) || 1 });
    return res.json({ ok: true, ...out });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`🕷️  Servidor 2 (SpiderTV) bot rodando em http://localhost:${PORT}`);
  console.log(`Painel: ${ORIGIN}`);
});

// Exporta funções para uso em outros módulos
export { renewServer2, findClientByCode, renewClient };
