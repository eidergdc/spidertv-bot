/**
 * Renovação automática — Servidor 1 (TropicalPlayTV)
 *
 * Fluxo:
 * 1) Faz login no painel (com Playwright) para obter um PHPSESSID válido.
 * 2) Usa a API nativa (/sys/api.php) para buscar cliente e renovar.
 * 3) Se a busca via API falhar, faz fallback pela UI para extrair o client_id.
 *
 * .env:
 *   BASE_URL=https://painel.tropicalplaytv.com
 *   SERVER1_USER=Eider Goncalves
 *   SERVER1_PASS=Goncalves1@
 *   PORT=8080
 *
 * Como rodar:
 *   npm install
 *   npx playwright install --with-deps
 *   node index.js
 *
 * Teste:
 *   curl http://localhost:8080/health
 *   curl -X POST http://localhost:8080/activate/spidertv \
 *     -H "Content-Type: application/json" \
 *     -d '{"code":"648718886","months":1}'
 */

import 'dotenv/config';
import express from 'express';
import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// --------------------------- ENV & Normalização ---------------------------

const RAW_BASE = (process.env.BASE_URL || 'https://painel.tropicalplaytv.com').replace(/\/+$/,'');
const ORIGIN   = new URL(RAW_BASE).origin; // garante https://painel.tropicalplaytv.com
const USERNAME = process.env.SERVER1_USER || '';
const PASSWORD = process.env.SERVER1_PASS || '';
const PORT     = Number(process.env.PORT || 8080);

// Arquivos auxiliares
const COOKIE_PATH = path.resolve(__dirname, 'server1_session.json'); // guarda PHPSESSID
const DEFAULT_HEADLESS = false; // headless no login (troque para false se quiser ver o navegador)

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
async function ensureDir(p){ try{ await fs.mkdir(p, { recursive:true }); } catch{} }

// --------------------------- Sessão / Login ---------------------------

async function loadSavedSession() {
  try {
    const raw = await fs.readFile(COOKIE_PATH, 'utf-8');
    const json = JSON.parse(raw);
    if (json && json.PHPSESSID) return json.PHPSESSID;
  } catch {}
  return null;
}

async function saveSession(phpsessid) {
  await fs.writeFile(COOKIE_PATH, JSON.stringify({ PHPSESSID: phpsessid }, null, 2));
}

/**
 * Faz login na tela /iptv/clients e retorna o cookie PHPSESSID
 */
async function loginAndGetPHPSESSID() {
  if (!USERNAME || !PASSWORD) {
    throw new Error('SERVER1_USER e SERVER1_PASS precisam estar definidos no .env');
  }

  const browser = await chromium.launch({ headless: DEFAULT_HEADLESS });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  try {
    // Primeiro vai para a página principal para fazer login
    await page.goto(`${ORIGIN}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    // Verifica se precisa logar (campo de senha / botão login)
    const needsLogin =
      (await page.$('input[type="password"]')) ||
      (await page.$('button:has-text("Login"), button:has-text("Entrar"), input[type="submit"]'));

    if (needsLogin) {
      const userInput = await page.$('#username');
      const passInput = await page.$('#password');
      if (!userInput) throw new Error('Campo de usuário não encontrado na tela de login.');
      if (!passInput) throw new Error('Campo de senha não encontrado na tela de login.');

      await userInput.fill(USERNAME);
      await passInput.fill(PASSWORD);

      const loginBtn = await page.$('#button-login');
      if (!loginBtn) throw new Error('Botão de login não encontrado.');
      await loginBtn.click();

      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1200);
    }

    // Agora vai para a página de clientes
    await page.goto(`${ORIGIN}/iptv/clients`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    // Em qualquer caso, tenta obter o cookie
    const cookies = await context.cookies(ORIGIN);
    const sess = cookies.find(c => c.name === 'PHPSESSID');
    if (!sess || !sess.value) {
      const tmp = path.resolve(__dirname, 'tmp');
      await ensureDir(tmp);
      const ts = new Date().toISOString().replace(/[:.]/g,'-');
      const shot = path.join(tmp, `server1-login-error-${ts}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      throw new Error(`Não foi possível obter PHPSESSID após login. Screenshot: ${shot}`);
    }

    await browser.close();
    return sess.value;
  } catch (err) {
    try {
      const tmp = path.resolve(__dirname, 'tmp');
      await ensureDir(tmp);
      const ts = new Date().toISOString().replace(/[:.]/g,'-');
      await page.screenshot({ path: path.join(tmp, `server1-login-fail-${ts}.png`), fullPage: true });
    } catch {}
    await browser.close();
    throw err;
  }
}

/**
 * Retorna um PHPSESSID utilizável:
 * 1) tenta carregar de arquivo
 * 2) se não houver/estiver inválido, faz login e salva
 */
async function getValidPHPSESSID() {
  let sid = await loadSavedSession();
  if (sid && await testSession(sid)) return sid;

  // Se inválido, re-login
  sid = await loginAndGetPHPSESSID();
  await saveSession(sid);

  // Valida só por garantia
  if (!(await testSession(sid))) {
    throw new Error('Sessão obtida no login parece inválida.');
  }
  return sid;
}

// --------------------------- API do Servidor 1 ---------------------------

/**
 * Faz GET/POST em /sys/api.php com cabeçalhos corretos
 * - pathAndQuery deve começar com "?action=..."
 * - se method='POST', passe "form" como objeto (será enviado como x-www-form-urlencoded)
 */
async function s1Fetch(pathAndQuery, phpsessid, { method = 'GET', form = null } = {}) {
  const url = `${ORIGIN}/sys/api.php${pathAndQuery}`;
  const headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': `${ORIGIN}/iptv/clients`,
    'Cookie': `PHPSESSID=${phpsessid}`
  };
  let fetchOpts = { method, headers };

  if (method === 'POST') {
    const body = new URLSearchParams(form || {}).toString();
    headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    fetchOpts = { ...fetchOpts, body };
  }

  const res = await fetch(url, fetchOpts);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Sessão inválida/expirada. Resposta (parcial): ${text.slice(0,200)}…`);
  }
  return await res.json();
}

/** Checa rapidamente se o PHPSESSID ainda é aceito pela API */
async function testSession(phpsessid) {
  try {
    const data = await s1Fetch('?action=get_clients&draw=1&start=0&length=1&search[value]=', phpsessid);
    // se veio JSON no formato esperado, consideramos válido
    return !!data && (Array.isArray(data.data) || data.data === undefined || data.success !== undefined || data.result !== 'failed');
  } catch {
    return false;
  }
}

/**
 * Tenta buscar clientes via GET; se falhar, tenta via POST (form-url-encoded).
 * Lança erro se ambas as tentativas falharem.
 */
async function s1GetClientsFlexible({ code, start = 0, length = 50, phpsessid }) {
  const baseParams = {
    action: 'get_clients',
    draw: '1',
    start: String(start),
    length: String(length),
    'search[value]': String(code),
    'search[regex]': 'false'
  };

  // Tentativa A: GET
  try {
    const q = '?' + new URLSearchParams(baseParams).toString();
    const data = await s1Fetch(q, phpsessid, { method: 'GET' });
    if (data && Array.isArray(data.data) && data.result !== 'failed') {
      return data;
    }
  } catch (_) {}

  // Tentativa B: POST (alguns painéis só aceitam POST)
  const q = '?action=get_clients';
  const data = await s1Fetch(q, phpsessid, { method: 'POST', form: baseParams });
  if (data && Array.isArray(data.data) && data.result !== 'failed') {
    return data;
  }

  throw new Error('get_clients falhou (GET e POST).');
}

/**
 * Fallback pela UI: digita no campo de pesquisa e tenta extrair o client_id
 */
async function s1FindClientIdViaUI(code, months = 1) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  try {
    // Primeiro faz login na página principal
    await page.goto(`${ORIGIN}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    // Verifica se precisa logar
    const needsLogin =
      (await page.$('input[type="password"]')) ||
      (await page.$('button:has-text("Login"), button:has-text("Entrar"), input[type="submit"]'));

    if (needsLogin) {
      const userInput = await page.$('#username');
      const passInput = await page.$('#password');
      if (!userInput) throw new Error('Campo de usuário não encontrado na tela de login.');
      if (!passInput) throw new Error('Campo de senha não encontrado na tela de login.');

      await userInput.fill(USERNAME);
      await passInput.fill(PASSWORD);

      const loginBtn = await page.$('#button-login');
      if (!loginBtn) throw new Error('Botão de login não encontrado.');
      await loginBtn.click();

      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1200);
    }

    // Agora vai para a página de clientes
    await page.goto(`${ORIGIN}/iptv/clients`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    // Verifica se ainda está na página de login (se redirecionou)
    const stillNeedsLogin = await page.$('input[type="password"]');
    if (stillNeedsLogin) {
      console.log('🔐 Ainda na página de login, fazendo login novamente...');

      // Lista todos os inputs e botões para debug
      console.log('🔍 Listando todos os inputs na página:');
      const allInputs = await page.$$('input');
      for (let i = 0; i < allInputs.length; i++) {
        const input = allInputs[i];
        const type = await input.getAttribute('type') || 'text';
        const name = await input.getAttribute('name') || '';
        const placeholder = await input.getAttribute('placeholder') || '';
        const id = await input.getAttribute('id') || '';
        console.log(`  ${i+1}. type="${type}" name="${name}" placeholder="${placeholder}" id="${id}"`);
      }

      console.log('🔍 Listando todos os botões na página:');
      const allButtons = await page.$$('button, input[type="submit"]');
      for (let i = 0; i < allButtons.length; i++) {
        const btn = allButtons[i];
        const text = await btn.innerText().catch(()=>'');
        const type = await btn.getAttribute('type') || '';
        const id = await btn.getAttribute('id') || '';
        console.log(`  ${i+1}. text="${text}" type="${type}" id="${id}"`);
      }

      // Tenta encontrar campos de login com seletores mais genéricos
      let userInput = await page.$('#username');
      if (!userInput) userInput = await page.$('input[name="username"]');
      if (!userInput) userInput = await page.$('input[placeholder*="Usuário" i]');
      if (!userInput) userInput = await page.$('input[placeholder*="Username" i]');
      if (!userInput) userInput = await page.$('input[type="text"]:not([name="search"])');

      let passInput = await page.$('#password');
      if (!passInput) passInput = await page.$('input[name="password"]');
      if (!passInput) passInput = await page.$('input[placeholder*="Senha" i]');
      if (!passInput) passInput = await page.$('input[placeholder*="Password" i]');
      if (!passInput) passInput = await page.$('input[type="password"]');

      if (!userInput || !passInput) {
        throw new Error('Campos de login não encontrados.');
      }

      console.log('✅ Campos de login encontrados, preenchendo...');
      await userInput.fill(USERNAME);
      await passInput.fill(PASSWORD);

      // Tenta encontrar botão de login
      let loginBtn = await page.$('#button-login');
      if (!loginBtn) loginBtn = await page.$('button:has-text("Login")');
      if (!loginBtn) loginBtn = await page.$('button:has-text("Entrar")');
      if (!loginBtn) loginBtn = await page.$('input[type="submit"]');
      if (!loginBtn) loginBtn = await page.$('button[type="submit"]');

      if (!loginBtn) {
        throw new Error('Botão de login não encontrado.');
      }

      console.log('✅ Botão de login encontrado, clicando...');
      await loginBtn.click();

      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1200);

      // Vai novamente para a página de clientes após login
      await page.goto(`${ORIGIN}/iptv/clients`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
    }

    // Busca o campo de pesquisa e digita o código
    console.log('🔍 Procurando campo de pesquisa...');

    // Tenta múltiplos seletores baseados no debug
    let search = await page.$('input[type="search"]');
    if (!search) search = await page.$('.form-control.form-control-sm');
    if (!search) search = await page.$('input.form-control');
    if (!search) search = await page.$('input[type="text"].form-control');
    if (!search) search = await page.$('input[name="search"]');
    if (!search) search = await page.$('input[placeholder*="search" i]');

    if (!search) {
      // Lista todos os inputs disponíveis para debug
      const allInputs = await page.$$('input');
      console.log(`Encontrados ${allInputs.length} inputs na página:`);
      for (let i = 0; i < allInputs.length; i++) {
        const input = allInputs[i];
        const type = await input.getAttribute('type') || 'text';
        const name = await input.getAttribute('name') || '';
        const placeholder = await input.getAttribute('placeholder') || '';
        const className = await input.getAttribute('class') || '';
        console.log(`  ${i+1}. type="${type}" name="${name}" placeholder="${placeholder}" class="${className}"`);
      }
      throw new Error('UI: campo de pesquisa não encontrado.');
    }

    await search.click();
    await search.fill(String(code));
    console.log('✅ Campo de pesquisa encontrado e preenchido');
    await page.keyboard.press('Enter').catch(()=>{});
    await page.waitForTimeout(3000); // Aumentar tempo de espera para 3 segundos

    // Pega a primeira linha da tabela (tenta diferentes seletores)
    console.log('🔍 Procurando linhas da tabela...');
    let firstRow = await page.$('table tbody tr');
    if (!firstRow) {
      // Tenta outros seletores para tabela
      firstRow = await page.$('table tr');
    }
    if (!firstRow) {
      // Tenta encontrar qualquer elemento que contenha dados de cliente
      const possibleRows = await page.$$('tr, .row, [data-client], [data-id]');
      if (possibleRows.length > 0) {
        firstRow = possibleRows[0];
      }
    }
    if (!firstRow) throw new Error('UI: nenhuma linha encontrada após a busca.');

    console.log('✅ Linha encontrada, procurando client_id...');

    // Procura algum link/botão na linha que tenha o ID na URL (ex.: ...client_id=68 ou /edit/68)
    const linkWithId =
      await firstRow.$('a[href*="client_id="], a[href*="/edit/"], a[href*="/clients/"], a[href*="client"], button[data-id], a[data-id], [data-client-id]');

    let clientId = null;

    if (linkWithId) {
      const href = await linkWithId.getAttribute('href').catch(()=>null);
      const dataId = await linkWithId.getAttribute('data-id').catch(()=>null);
      const dataClientId = await linkWithId.getAttribute('data-client-id').catch(()=>null);

      if (href) {
        let m = href.match(/client_id=(\d{1,10})/);
        if (!m) m = href.match(/\/edit\/(\d{1,10})/);
        if (!m) m = href.match(/\/clients\/(\d{1,10})/);
        if (!m) m = href.match(/client[_-]?id=(\d{1,10})/i);
        if (!m) m = href.match(/\/(\d{1,10})/); // último recurso: qualquer número na URL
        if (m) clientId = m[1];
      }
      if (!clientId && dataId && /^\d+$/.test(dataId)) clientId = dataId;
      if (!clientId && dataClientId && /^\d+$/.test(dataClientId)) clientId = dataClientId;
    }

    // Último recurso: extrai um número grande da própria linha
    if (!clientId) {
      const html = await firstRow.innerHTML();
      const m = html.match(/\b(\d{1,10})\b/);
      if (m) clientId = m[1];
    }

    if (!clientId) throw new Error('UI: não consegui extrair client_id da primeira linha.');
    console.log(`✅ Client ID encontrado: ${clientId}`);

    // Novo código para clicar no botão calendário e confirmar renovação
    console.log('🔍 Procurando botão calendário...');
    const calendarBtn = await firstRow.$('i.fad.fa-calendar-alt');
    if (!calendarBtn) {
      throw new Error('UI: botão calendário não encontrado.');
    }
    await calendarBtn.click();
    await page.waitForTimeout(1000);

    // Espera o modal de renovação aparecer
    console.log('🔍 Esperando modal de renovação...');
    const modal = await page.waitForSelector('div.bootbox.modal.fade.show', { timeout: 5000 });
    if (!modal) {
      throw new Error('UI: modal de renovação não apareceu.');
    }

    // Preenche a quantidade de meses no input do modal
    const monthsInput = await modal.$('input#months');
    if (!monthsInput) {
      throw new Error('UI: input de meses não encontrado no modal.');
    }
    await monthsInput.fill(String(months));

    // Clica no botão confirmar no modal
    const confirmBtn = await modal.$('button.btn.btn-info.btnrenewplus');
    if (!confirmBtn) {
      throw new Error('UI: botão confirmar não encontrado no modal.');
    }
    await confirmBtn.click();

    console.log('✅ Renovação confirmada no modal.');

    await page.waitForTimeout(2000); // espera a ação completar

    await browser.close();
    return clientId;
  } catch (err) {
    try {
      const tmp = path.resolve(__dirname, 'tmp');
      await ensureDir(tmp);
      const ts = new Date().toISOString().replace(/[:.]/g,'-');
      await page.screenshot({ path: path.join(tmp, `server1-ui-findid-${ts}.png`), fullPage: true });
    } catch {}
    await browser.close();
    throw err;
  }
}

/**
 * Busca client_id pelo texto que você digita na busca (ex.: 648718886)
 * - Tenta API (GET, depois POST);
 * - Se falhar, cai na UI pra descobrir.
 */
async function s1FindClientIdByCode(code, phpsessid, months = 1) {
  try {
    const data = await s1GetClientsFlexible({ code, start: 0, length: 50, phpsessid });
    const rows = data?.data || [];
    // tenta achar a linha com o texto; senão pega a primeira
    const row = rows.find(r => JSON.stringify(r).includes(String(code))) || rows[0];

    if (!row) return null;
    const id = row.client_id ?? row.id ?? (Array.isArray(row) ? row[0] : null);
    if (id) return String(id);

    // tenta extrair um número das colunas
    const str = JSON.stringify(row);
    const m = str.match(/\b(\d{1,10})\b/);
    if (m) return m[1];

    // sem ID legível → parte pra UI
    return await s1FindClientIdViaUI(code, months);
  } catch {
    // se a API falhar, tenta pela UI
    return await s1FindClientIdViaUI(code, months);
  }
}

/** Chama a renovação */
async function s1RenewByClientId(clientId, months, phpsessid) {
  const params = new URLSearchParams({
    action: 'renew_client_plus',
    client_id: String(clientId),
    months: String(months || 1),
  });
  const data = await s1Fetch(`?${params.toString()}`, phpsessid);
  const ok = (data?.status?.toLowerCase?.() === 'success') || data?.success === true;
  return { ok, raw: data };
}

// --------------------------- Fluxo principal ---------------------------

/**
 * POST /activate/spidertv
 * body: { code: "648718886", months?: 1 }
 */
async function renewServer1({ code, months = 1 }) {
  // obtém / reaproveita sessão automaticamente
  let phpsessid = await getValidPHPSESSID();

  // busca o client_id
  let clientId = await s1FindClientIdByCode(code, phpsessid, months);
  if (!clientId) {
    // sessão pode ter expirado entre chamadas — tenta login novamente
    phpsessid = await loginAndGetPHPSESSID();
    await saveSession(phpsessid);
    clientId = await s1FindClientIdByCode(code, phpsessid, months);
    if (!clientId) throw new Error(`Cliente não encontrado para o código "${code}".`);
  }

  // renova
  let result = await s1RenewByClientId(clientId, months, phpsessid);
  if (!result.ok) {
    // fallback: re-login 1x e tenta de novo (se sessão caiu)
    phpsessid = await loginAndGetPHPSESSID();
    await saveSession(phpsessid);
    result = await s1RenewByClientId(clientId, months, phpsessid);
  }

  if (!result.ok) {
    throw new Error(`Falha na renovação (API não retornou sucesso): ${JSON.stringify(result.raw)}`);
  }

  return { ok: true, clientId, response: result.raw };
}

// --------------------------- Sistema de Fila ---------------------------

let filaRenovacao = [];
let processandoAtualmente = false;

console.log('🕷️ Bot Servidor 1 - Sistema de Fila: ATIVADO');

/**
 * Processa a fila de renovações (uma por vez)
 */
async function processarFila() {
  if (processandoAtualmente || filaRenovacao.length === 0) {
    return;
  }

  processandoAtualmente = true;
  const { req, res, timestamp } = filaRenovacao.shift();

  console.log(`\n📋 PROCESSANDO FILA - ${filaRenovacao.length} restantes`);
  console.log(`🎯 Atual: ${req.body.code} (${req.body.months || 1} meses)`);

  try {
    const { code, months = 1 } = req.body || {};
    const out = await renewServer1({ code, months: Number(months) || 1 });
    res.json({ ok: true, ...out, filaRestante: filaRenovacao.length });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err), filaRestante: filaRenovacao.length });
  } finally {
    processandoAtualmente = false;
    // Processar próximo da fila após um pequeno delay
    setTimeout(processarFila, 1000);
  }
}

// --------------------------- API HTTP ---------------------------

const app = express();
app.use(express.json({ limit: '2mb' }));

// 🌐 Servir arquivos estáticos da pasta public
app.use(express.static('public'));

app.get('/health', async (_req, res) => {
  const sess = await loadSavedSession();
  res.json({
    status: 'ok',
    base: ORIGIN,
    mode: 'server1',
    hasSessionSaved: !!sess,
    filaAtual: filaRenovacao.length,
    processandoAtualmente
  });
});

app.get('/fila', (req, res) => {
  res.json({
    filaAtual: filaRenovacao.length,
    processandoAtualmente,
    proximosClientes: filaRenovacao.slice(0, 5).map(item => ({
      cliente: item.req.body.code,
      meses: item.req.body.months || 1,
      timestamp: item.timestamp
    }))
  });
});

app.post('/activate/spidertv', async (req, res) => {
  try {
    const { code, months = 1 } = req.body || {};
    if (!code) return res.status(400).json({ ok: false, error: 'code é obrigatório' });

    // Adicionar à fila
    filaRenovacao.push({
      req,
      res,
      timestamp: new Date().toISOString()
    });

    console.log(`📥 ADICIONADO À FILA: Cliente ${code} (${months} meses)`);
    console.log(`📋 Posição na fila: ${filaRenovacao.length}`);

    if (processandoAtualmente) {
      console.log(`⏳ Aguardando... Processando outro cliente`);
    }

    // Iniciar processamento da fila
    processarFila();

  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor 1 bot rodando em http://localhost:${PORT}`);
  console.log(`Painel: ${ORIGIN}`);
});

// Adicionando log para verificar se o servidor está escutando na porta correta
console.log(`Tentando iniciar servidor na porta ${PORT}...`);
