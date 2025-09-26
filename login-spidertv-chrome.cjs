/**
 * Bot para login no SpiderTV usando Chrome do sistema
 */

const puppeteer = require('puppeteer');

console.log('🕷️ Bot SpiderTV - Login com Chrome do Sistema');

// Configurações do SpiderTV
const SPIDERTV_URL = 'https://spidertv.sigma.st';
const USERNAME = 'eidergoncalves@gmail.com'; // Substitua pelo seu email
const PASSWORD = 'Goncalves1'; // Substitua pela sua senha

console.log('🌐 URL:', SPIDERTV_URL);
console.log('👤 Usuário:', USERNAME);

async function loginSpiderTV() {
    let browser;
    
    try {
        console.log('🚀 Lançando Chrome...');
        
        // Tentar usar Chrome do sistema
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 2000, // Bem devagar para você ver
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // Chrome no macOS
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        
        console.log('✅ Chrome lançado com sucesso!');
        
        const page = await browser.newPage();
        console.log('✅ Nova página criada');
        
        // Configurar viewport
        await page.setViewport({ width: 1280, height: 720 });
        
        // Configurar user agent
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        console.log('🌐 Navegando para SpiderTV...');
        await page.goto(SPIDERTV_URL, { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        console.log('✅ Página carregada!');
        
        // Aguardar um pouco
        await page.waitForTimeout(3000);
        
        // Tirar screenshot inicial
        await page.screenshot({ path: 'spidertv-inicial.png', fullPage: true });
        console.log('📸 Screenshot inicial salvo');
        
        // Verificar título e URL
        const title = await page.title();
        const url = page.url();
        console.log('📄 Título:', title);
        console.log('🌐 URL atual:', url);
        
        // Procurar campos de login
        console.log('🔍 Procurando campos de login...');
        
        // Aguardar campos aparecerem
        try {
            await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
            console.log('✅ Campo de email encontrado!');
        } catch (e) {
            console.log('⚠️ Campo de email não encontrado, continuando...');
        }
        
        // Procurar todos os inputs
        const inputs = await page.$$('input');
        console.log(`📝 Encontrados ${inputs.length} campos de input`);
        
        // Tentar encontrar campos de login
        const emailField = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
        const passwordField = await page.$('input[type="password"]');
        
        if (emailField && passwordField) {
            console.log('✅ Campos de login encontrados!');
            
            // Preencher email
            console.log('📧 Preenchendo email...');
            await emailField.click();
            await emailField.type(USERNAME, { delay: 100 });
            
            // Preencher senha
            console.log('🔒 Preenchendo senha...');
            await passwordField.click();
            await passwordField.type(PASSWORD, { delay: 100 });
            
            // Screenshot com campos preenchidos
            await page.screenshot({ path: 'spidertv-preenchido.png', fullPage: true });
            console.log('📸 Screenshot com campos preenchidos');
            
            // Procurar botão de login
            console.log('🔍 Procurando botão de login...');
            const loginButton = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), input[type="submit"], button:has-text("Entrar")');
            
            if (loginButton) {
                console.log('✅ Botão de login encontrado!');
                console.log('🔄 Clicando no botão...');
                
                await loginButton.click();
                
                // Aguardar navegação
                console.log('⏳ Aguardando redirecionamento...');
                try {
                    await page.waitForNavigation({ 
                        waitUntil: 'networkidle0', 
                        timeout: 20000 
                    });
                    console.log('✅ Redirecionamento concluído!');
                } catch (e) {
                    console.log('⚠️ Timeout no redirecionamento, continuando...');
                }
                
                // Screenshot após login
                await page.screenshot({ path: 'spidertv-apos-login.png', fullPage: true });
                console.log('📸 Screenshot após login');
                
                // Verificar se login foi bem-sucedido
                const newUrl = page.url();
                const newTitle = await page.title();
                
                console.log('🌐 Nova URL:', newUrl);
                console.log('📄 Novo título:', newTitle);
                
                if (newUrl !== SPIDERTV_URL && !newUrl.includes('/login')) {
                    console.log('🎉 LOGIN REALIZADO COM SUCESSO!');
                    
                    // Procurar por elementos que indicam sucesso
                    const dashboard = await page.$('[class*="dashboard"], [class*="panel"], [class*="menu"]');
                    if (dashboard) {
                        console.log('✅ Dashboard/painel detectado!');
                    }
                    
                } else {
                    console.log('❌ Login pode ter falhado - ainda na página de login');
                }
                
            } else {
                console.log('❌ Botão de login não encontrado');
                
                // Listar todos os botões disponíveis
                const buttons = await page.$$('button');
                console.log(`🔍 Encontrados ${buttons.length} botões na página`);
                
                for (let i = 0; i < Math.min(buttons.length, 5); i++) {
                    const buttonText = await buttons[i].textContent();
                    console.log(`  Botão ${i + 1}: "${buttonText}"`);
                }
            }
            
        } else {
            console.log('❌ Campos de login não encontrados');
            
            // Listar todos os inputs para debug
            for (let i = 0; i < Math.min(inputs.length, 10); i++) {
                const input = inputs[i];
                const type = await input.getAttribute('type');
                const name = await input.getAttribute('name');
                const placeholder = await input.getAttribute('placeholder');
                console.log(`  Input ${i + 1}: type="${type}", name="${name}", placeholder="${placeholder}"`);
            }
        }
        
        // Aguardar 30 segundos para inspeção manual
        console.log('👀 Aguardando 30 segundos para você inspecionar o resultado...');
        await page.waitForTimeout(30000);
        
        console.log('🎉 Processo concluído!');
        
    } catch (error) {
        console.error('❌ Erro durante login:', error.message);
        
        if (browser) {
            try {
                const page = (await browser.pages())[0];
                if (page) {
                    await page.screenshot({ path: 'spidertv-erro.png', fullPage: true });
                    console.log('📸 Screenshot de erro salvo');
                }
            } catch (e) {
                console.log('⚠️ Não foi possível tirar screenshot de erro');
            }
        }
        
    } finally {
        if (browser) {
            console.log('🔄 Fechando navegador...');
            await browser.close();
            console.log('✅ Navegador fechado');
        }
    }
}

// Executar
loginSpiderTV().catch(console.error);
