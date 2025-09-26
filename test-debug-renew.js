/**
 * Teste com debug detalhado para renovar cliente 364572675
 */

console.log('🔍 INICIANDO TESTE DE DEBUG...');

// Teste 1: Verificar imports
console.log('📦 Testando imports...');
try {
  console.log('  - Importando dotenv...');
  await import('dotenv/config');
  console.log('  ✅ dotenv OK');
  
  console.log('  - Importando playwright...');
  const { chromium } = await import('playwright');
  console.log('  ✅ playwright OK');
  
} catch (error) {
  console.error('❌ Erro nos imports:', error.message);
  process.exit(1);
}

// Teste 2: Verificar variáveis de ambiente
console.log('🔧 Verificando variáveis de ambiente...');
const USERNAME = process.env.SERVER2_USER || '';
const PASSWORD = process.env.SERVER2_PASS || '';

console.log('  - USERNAME:', USERNAME ? 'definido' : 'NÃO DEFINIDO');
console.log('  - PASSWORD:', PASSWORD ? 'definido' : 'NÃO DEFINIDO');

if (!USERNAME || !PASSWORD) {
  console.log('⚠️ Variáveis não definidas, mas continuando para teste...');
}

// Teste 3: Inicializar Playwright
console.log('🚀 Inicializando Playwright...');
try {
  const { chromium } = await import('playwright');
  
  console.log('  - Lançando navegador...');
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  console.log('  ✅ Navegador lançado');
  
  console.log('  - Criando contexto...');
  const context = await browser.newContext();
  console.log('  ✅ Contexto criado');
  
  console.log('  - Criando página...');
  const page = await context.newPage();
  console.log('  ✅ Página criada');
  
  // Teste 4: Navegar para SpiderTV
  console.log('🌐 Navegando para SpiderTV...');
  await page.goto('https://spidertv.sigma.st', { waitUntil: 'domcontentloaded' });
  console.log('  ✅ Página carregada');
  
  // Aguardar um pouco
  console.log('⏳ Aguardando 3 segundos...');
  await page.waitForTimeout(3000);
  
  // Tirar screenshot
  console.log('📸 Tirando screenshot...');
  await page.screenshot({ path: 'debug-spidertv-loaded.png', fullPage: true });
  console.log('  ✅ Screenshot salvo: debug-spidertv-loaded.png');
  
  // Verificar título da página
  const title = await page.title();
  console.log('  📄 Título da página:', title);
  
  // Procurar campos de login
  console.log('🔍 Procurando campos de login...');
  
  const emailField = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
  const passwordField = await page.$('input[type="password"], input[name="password"]');
  
  console.log('  - Campo email:', emailField ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
  console.log('  - Campo senha:', passwordField ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
  
  if (emailField && passwordField && USERNAME && PASSWORD) {
    console.log('🔐 Tentando fazer login...');
    
    await emailField.fill(USERNAME);
    console.log('  ✅ Email preenchido');
    
    await passwordField.fill(PASSWORD);
    console.log('  ✅ Senha preenchida');
    
    // Procurar botão de login
    const loginButton = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
    console.log('  - Botão login:', loginButton ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
    
    if (loginButton) {
      console.log('  🔄 Clicando no botão de login...');
      await loginButton.click();
      
      console.log('  ⏳ Aguardando 5 segundos após login...');
      await page.waitForTimeout(5000);
      
      // Screenshot após login
      await page.screenshot({ path: 'debug-after-login.png', fullPage: true });
      console.log('  📸 Screenshot pós-login: debug-after-login.png');
      
      // Verificar URL atual
      const currentUrl = page.url();
      console.log('  🌐 URL atual:', currentUrl);
    }
  } else {
    console.log('⚠️ Não foi possível fazer login (campos ou credenciais ausentes)');
  }
  
  // Aguardar para inspeção manual
  console.log('👀 Aguardando 10 segundos para inspeção manual...');
  await page.waitForTimeout(10000);
  
  // Fechar navegador
  console.log('🔄 Fechando navegador...');
  await browser.close();
  console.log('  ✅ Navegador fechado');
  
  console.log('🎉 Teste de debug concluído com sucesso!');
  
} catch (error) {
  console.error('❌ Erro durante teste:', error.message);
  console.error('Stack:', error.stack);
}

console.log('🏁 FIM DO TESTE');
process.exit(0);
