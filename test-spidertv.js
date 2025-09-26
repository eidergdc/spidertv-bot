/**
 * Teste específico do Servidor 2 (SpiderTV)
 */

import 'dotenv/config';
import { chromium } from 'playwright';

console.log('🕷️ Testando SpiderTV (Servidor 2)...');

// Configurações
const SPIDERTV_URL = 'https://spidertv.sigma.st';
const USERNAME = process.env.SERVER2_USER || '';
const PASSWORD = process.env.SERVER2_PASS || '';

console.log('URL:', SPIDERTV_URL);
console.log('Username:', USERNAME ? 'definido' : 'não definido');
console.log('Password:', PASSWORD ? 'definido' : 'não definido');

if (!USERNAME || !PASSWORD) {
  console.error('❌ SERVER2_USER e SERVER2_PASS precisam estar definidos no .env');
  process.exit(1);
}

async function testSpiderTVLogin() {
  console.log('🚀 Iniciando teste de login...');
  
  const browser = await chromium.launch({ 
    headless: false, // Deixar visível para debug
    slowMo: 1000 // Mais lento para acompanhar
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📱 Navegando para SpiderTV...');
    await page.goto(SPIDERTV_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    console.log('🔍 Procurando campos de login...');
    
    // Procurar campos de login
    const emailField = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordField = await page.$('input[type="password"], input[name="password"]');
    
    if (!emailField) {
      console.error('❌ Campo de email não encontrado');
      await page.screenshot({ path: 'debug-no-email.png', fullPage: true });
      return false;
    }
    
    if (!passwordField) {
      console.error('❌ Campo de senha não encontrado');
      await page.screenshot({ path: 'debug-no-password.png', fullPage: true });
      return false;
    }
    
    console.log('✅ Campos encontrados, preenchendo...');
    
    // Preencher campos
    await emailField.fill(USERNAME);
    await passwordField.fill(PASSWORD);
    
    console.log('🔍 Procurando botão de login...');
    
    // Procurar botão de login
    const loginButton = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), input[type="submit"]');
    
    if (!loginButton) {
      console.error('❌ Botão de login não encontrado');
      await page.screenshot({ path: 'debug-no-button.png', fullPage: true });
      return false;
    }
    
    console.log('✅ Botão encontrado, fazendo login...');
    await page.screenshot({ path: 'debug-before-login.png', fullPage: true });
    
    // Fazer login
    await loginButton.click();
    await page.waitForTimeout(3000);
    
    console.log('🔍 Verificando se login foi bem-sucedido...');
    await page.screenshot({ path: 'debug-after-login.png', fullPage: true });
    
    // Verificar se login foi bem-sucedido (procurar por elementos do dashboard)
    const dashboardElements = await page.$$('nav, .dashboard, .sidebar, [class*="dashboard"], [class*="panel"]');
    
    if (dashboardElements.length > 0) {
      console.log('✅ Login bem-sucedido! Dashboard detectado.');
      
      // Tentar navegar para página de clientes
      console.log('🔍 Procurando página de clientes...');
      
      const clientsLink = await page.$('a[href*="client"], a:has-text("Client"), a:has-text("Customer"), a[href*="customer"]');
      
      if (clientsLink) {
        console.log('✅ Link de clientes encontrado, navegando...');
        await clientsLink.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'debug-clients-page.png', fullPage: true });
      } else {
        console.log('⚠️ Link de clientes não encontrado, mas login foi bem-sucedido');
      }
      
      return true;
    } else {
      console.error('❌ Login falhou - dashboard não detectado');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
    await page.screenshot({ path: 'debug-error.png', fullPage: true });
    return false;
  } finally {
    console.log('🔄 Aguardando 5 segundos para inspeção manual...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// Executar teste
testSpiderTVLogin()
  .then(success => {
    if (success) {
      console.log('🎉 Teste do SpiderTV concluído com sucesso!');
      process.exit(0);
    } else {
      console.log('❌ Teste do SpiderTV falhou');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error.message);
    process.exit(1);
  });
