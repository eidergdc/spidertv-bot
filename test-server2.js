/**
 * Teste simples do Servidor 2 (SpiderTV)
 */

import 'dotenv/config';
import { chromium } from 'playwright';

const SERVER2_CONFIG = {
  baseUrl: 'https://spidertv.sigma.st',
  username: 'tropicalplay',
  password: 'Virginia13'
};

async function testServer2Login() {
  console.log('🔍 Testando login no Servidor 2 (SpiderTV)...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  try {
    console.log('📱 Navegando para página de login...');
    await page.goto(`${SERVER2_CONFIG.baseUrl}/#/sign-in`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    console.log('👤 Preenchendo credenciais...');
    
    // Preenche usuário
    const userInput = await page.$('input[placeholder*="Username" i], input[placeholder*="Email" i]') || 
                      (await page.$$('input[type="text"], input[type="email"]'))[0];
    if (!userInput) throw new Error('Campo de usuário não encontrado');
    await userInput.fill(SERVER2_CONFIG.username);

    // Preenche senha
    const passInput = await page.$('input[type="password"]');
    if (!passInput) throw new Error('Campo de senha não encontrado');
    await passInput.fill(SERVER2_CONFIG.password);

    console.log('🔐 Fazendo login...');
    
    // Clica em login
    const loginBtn = await page.$('button:has-text("Continue"), button:has-text("Login"), button:has-text("Entrar")');
    if (!loginBtn) throw new Error('Botão de login não encontrado');
    await loginBtn.click();

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Fecha modal se aparecer
    const modalOk = await page.$('button:has-text("OK")');
    if (modalOk) {
      console.log('📋 Fechando modal...');
      await modalOk.click();
      await page.waitForTimeout(2000);
    }

    // Verifica login
    const currentUrl = page.url();
    console.log('🌐 URL atual:', currentUrl);
    
    if (currentUrl.includes('dashboard') || currentUrl.includes('clients')) {
      console.log('✅ Login realizado com sucesso!');
      
      // Navega para clientes
      console.log('📋 Navegando para página de clientes...');
      await page.goto(`${SERVER2_CONFIG.baseUrl}/#/clients`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      // Fecha modal se aparecer novamente
      const modalOk2 = await page.$('button:has-text("OK")');
      if (modalOk2) {
        await modalOk2.click();
        await page.waitForTimeout(1000);
      }
      
      console.log('🔍 Testando busca de cliente...');
      
      // Testa busca
      const searchInput = await page.$('input[placeholder*="Pesquisar" i], input[type="search"]') ||
                          (await page.$$('input[type="text"]'))[0];
      if (searchInput) {
        await searchInput.fill('155357738');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
        console.log('✅ Busca executada!');
      }
      
      console.log('🎯 Teste concluído com sucesso!');
      console.log('⏳ Aguardando 10 segundos para inspeção manual...');
      await page.waitForTimeout(10000);
      
    } else {
      throw new Error('Login falhou - não redirecionou para dashboard');
    }

  } catch (err) {
    console.error('❌ Erro:', err.message);
    await page.screenshot({ path: 'test-server2-error.png', fullPage: true });
    console.log('📸 Screenshot salvo como test-server2-error.png');
  } finally {
    await browser.close();
  }
}

testServer2Login().catch(console.error);
