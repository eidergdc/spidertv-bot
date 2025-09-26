/**
 * Teste simples - apenas login no SpiderTV (Servidor 2)
 */

const puppeteer = require('puppeteer');

console.log('🕷️ Teste de Login no SpiderTV (Servidor 2)');

// Configurações
const SPIDERTV_URL = 'https://spidertv.sigma.st';
const USERNAME = process.env.SERVER2_USER || 'seu_email@exemplo.com';
const PASSWORD = process.env.SERVER2_PASS || 'sua_senha';

console.log('🌐 URL:', SPIDERTV_URL);
console.log('👤 Usuário:', USERNAME);

async function testLogin() {
    let browser;
    
    try {
        console.log('🚀 Lançando navegador...');
        browser = await puppeteer.launch({
            headless: false, // Visível para você ver
            slowMo: 1000,    // Bem devagar
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        console.log('✅ Navegador lançado');
        
        const page = await browser.newPage();
        console.log('✅ Página criada');
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        console.log('✅ User agent definido');
        
        console.log('🌐 Navegando para SpiderTV...');
        await page.goto(SPIDERTV_URL, { waitUntil: 'networkidle2' });
        console.log('✅ Página carregada');
        
        // Aguardar 3 segundos
        console.log('⏳ Aguardando 3 segundos...');
        await page.waitForTimeout(3000);
        
        // Tirar screenshot inicial
        console.log('📸 Tirando screenshot inicial...');
        await page.screenshot({ path: 'spidertv-inicial.png', fullPage: true });
        console.log('✅ Screenshot salvo: spidertv-inicial.png');
        
        // Verificar título
        const title = await page.title();
        console.log('📄 Título da página:', title);
        
        // Verificar URL
        const url = page.url();
        console.log('🌐 URL atual:', url);
        
        // Procurar campos de login
        console.log('🔍 Procurando campos de login...');
        
        const emailField = await page.$('input[type="email"], input[name="email"]');
        const passwordField = await page.$('input[type="password"]');
        
        console.log('📧 Campo email:', emailField ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
        console.log('🔒 Campo senha:', passwordField ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
        
        if (emailField && passwordField) {
            console.log('✅ Campos de login encontrados!');
            
            // Preencher com as credenciais
            console.log('📝 Preenchendo credenciais...');
            await emailField.type(USERNAME, { delay: 100 });
            await passwordField.type(PASSWORD, { delay: 100 });
            
            console.log('✅ Credenciais preenchidas');
            
            // Screenshot com campos preenchidos
            await page.screenshot({ path: 'spidertv-preenchido.png', fullPage: true });
            console.log('📸 Screenshot com campos preenchidos: spidertv-preenchido.png');
            
            // Procurar botão de login
            console.log('🔍 Procurando botão de login...');
            const loginButton = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), input[type="submit"]');
            
            if (loginButton) {
                console.log('✅ Botão de login encontrado!');
                console.log('🔄 Clicando no botão de login...');
                
                await loginButton.click();
                console.log('✅ Botão clicado');
                
                // Aguardar redirecionamento
                console.log('⏳ Aguardando redirecionamento...');
                try {
                    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
                    console.log('✅ Redirecionamento concluído');
                } catch (e) {
                    console.log('⚠️ Timeout no redirecionamento, continuando...');
                }
                
                // Screenshot após login
                await page.screenshot({ path: 'spidertv-apos-login.png', fullPage: true });
                console.log('📸 Screenshot após login: spidertv-apos-login.png');
                
                // Verificar se login foi bem-sucedido
                const currentUrl = page.url();
                console.log('🌐 URL após login:', currentUrl);
                
                if (currentUrl !== SPIDERTV_URL && !currentUrl.includes('/login')) {
                    console.log('🎉 LOGIN REALIZADO COM SUCESSO!');
                } else {
                    console.log('❌ Login pode ter falhado - ainda na página de login');
                }
            } else {
                console.log('❌ Botão de login não encontrado');
            }
        } else {
            console.log('❌ Campos de login não encontrados');
        }
        
        // Aguardar 15 segundos para inspeção manual
        console.log('👀 Aguardando 15 segundos para você inspecionar...');
        await page.waitForTimeout(15000);
        
        console.log('🎉 Teste de login concluído!');
        
    } catch (error) {
        console.error('❌ Erro durante teste:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (browser) {
            console.log('🔄 Fechando navegador...');
            await browser.close();
            console.log('✅ Navegador fechado');
        }
    }
}

testLogin();
