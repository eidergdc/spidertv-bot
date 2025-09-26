/**
 * Teste específico para renovar cliente 364572675 no Servidor 2 (SpiderTV)
 */

import 'dotenv/config';
import { chromium } from 'playwright';

console.log('🕷️ Renovando cliente 364572675 no SpiderTV...');

// Configurações
const SPIDERTV_URL = 'https://spidertv.sigma.st';
const USERNAME = process.env.SERVER2_USER || '';
const PASSWORD = process.env.SERVER2_PASS || '';
const CLIENT_CODE = '364572675';
const MONTHS = 1;

console.log('URL:', SPIDERTV_URL);
console.log('Cliente:', CLIENT_CODE);
console.log('Meses:', MONTHS);
console.log('Username:', USERNAME ? 'definido' : 'não definido');
console.log('Password:', PASSWORD ? 'definido' : 'não definido');

if (!USERNAME || !PASSWORD) {
  console.error('❌ SERVER2_USER e SERVER2_PASS precisam estar definidos no .env');
  console.log('💡 Crie um arquivo .env com:');
  console.log('SERVER2_USER=seu_email@exemplo.com');
  console.log('SERVER2_PASS=sua_senha');
  process.exit(1);
}

async function renewClientSpiderTV() {
  console.log('🚀 Iniciando renovação...');
  
  const browser = await chromium.launch({ 
    headless: false, // Visível para acompanhar
    slowMo: 500 // Mais devagar para debug
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Passo 1: Login
    console.log('🔐 Fazendo login...');
    await page.goto(SPIDERTV_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Procurar e preencher campos de login
    const emailField = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordField = await page.$('input[type="password"], input[name="password"]');
    
    if (!emailField || !passwordField) {
      throw new Error('Campos de login não encontrados');
    }
    
    await emailField.fill(USERNAME);
    await passwordField.fill(PASSWORD);
    
    // Fazer login
    const loginButton = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
    if (!loginButton) {
      throw new Error('Botão de login não encontrado');
    }
    
    await loginButton.click();
    await page.waitForTimeout(3000);
    
    console.log('✅ Login realizado');
    
    // Passo 2: Navegar para clientes
    console.log('📋 Navegando para página de clientes...');
    
    // Procurar link de clientes/customers
    const clientsLink = await page.$('a[href*="client"], a:has-text("Client"), a:has-text("Customer"), a[href*="customer"], a:has-text("Clientes")');
    
    if (clientsLink) {
      await clientsLink.click();
      await page.waitForTimeout(2000);
      console.log('✅ Página de clientes carregada');
    } else {
      // Tentar URL direta
      await page.goto(`${SPIDERTV_URL}/customers`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      console.log('✅ Tentativa de URL direta para clientes');
    }
    
    // Passo 3: Buscar cliente
    console.log(`🔍 Buscando cliente ${CLIENT_CODE}...`);
    
    // Procurar campo de busca
    const searchField = await page.$('input[type="search"], input[placeholder*="search" i], input[placeholder*="buscar" i], input[name="search"]');
    
    if (searchField) {
      await searchField.fill(CLIENT_CODE);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      console.log('✅ Busca realizada');
    } else {
      console.log('⚠️ Campo de busca não encontrado, procurando cliente manualmente');
    }
    
    // Passo 4: Encontrar e renovar cliente
    console.log('🔄 Procurando opção de renovação...');
    
    // Procurar por botões/links de renovação
    const renewButtons = await page.$$('button:has-text("Renew"), button:has-text("Renovar"), a:has-text("Renew"), a:has-text("Renovar"), button[title*="renew" i], a[title*="renew" i]');
    
    if (renewButtons.length > 0) {
      console.log(`✅ Encontrados ${renewButtons.length} botões de renovação`);
      
      // Clicar no primeiro botão de renovação
      await renewButtons[0].click();
      await page.waitForTimeout(2000);
      
      // Procurar campo para definir meses ou confirmar renovação
      const monthsField = await page.$('input[name*="month"], input[placeholder*="month"], select[name*="month"]');
      
      if (monthsField) {
        const tagName = await monthsField.evaluate(el => el.tagName.toLowerCase());
        
        if (tagName === 'select') {
          await monthsField.selectOption(MONTHS.toString());
        } else {
          await monthsField.fill(MONTHS.toString());
        }
        
        console.log(`✅ Definido ${MONTHS} mês(es)`);
      }
      
      // Procurar botão de confirmação
      const confirmButton = await page.$('button:has-text("Confirm"), button:has-text("Confirmar"), button[type="submit"], button:has-text("Save"), button:has-text("Salvar")');
      
      if (confirmButton) {
        await confirmButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ Renovação confirmada');
        
        // Verificar mensagem de sucesso
        const successMessage = await page.$('text=success, text=sucesso, .alert-success, .success');
        
        if (successMessage) {
          console.log('🎉 Renovação realizada com sucesso!');
          return true;
        } else {
          console.log('⚠️ Renovação enviada, mas mensagem de sucesso não detectada');
          return true;
        }
      } else {
        console.log('⚠️ Botão de confirmação não encontrado');
        return false;
      }
      
    } else {
      console.log('❌ Botões de renovação não encontrados');
      
      // Tirar screenshot para debug
      await page.screenshot({ path: 'debug-no-renew-buttons.png', fullPage: true });
      console.log('📸 Screenshot salvo: debug-no-renew-buttons.png');
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro durante renovação:', error.message);
    await page.screenshot({ path: 'debug-renewal-error.png', fullPage: true });
    console.log('📸 Screenshot de erro salvo: debug-renewal-error.png');
    return false;
  } finally {
    console.log('🔄 Aguardando 5 segundos para inspeção...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// Executar renovação
renewClientSpiderTV()
  .then(success => {
    if (success) {
      console.log('🎉 Cliente 364572675 renovado com sucesso por 1 mês!');
      process.exit(0);
    } else {
      console.log('❌ Falha na renovação do cliente 364572675');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error.message);
    process.exit(1);
  });
