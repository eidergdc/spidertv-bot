/**
 * Bot simples para login no SpiderTV
 */

const puppeteer = require('puppeteer');

console.log('🕷️ Bot SpiderTV - Login Simples');

async function loginSpiderTV() {
    let browser;
    
    try {
        console.log('🚀 Lançando Chromium...');
        
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 1000,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });
        
        console.log('✅ Chromium lançado!');
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        
        console.log('🌐 Navegando para SpiderTV...');
        await page.goto('https://spidertv.sigma.st', { 
            waitUntil: 'domcontentloaded',
            timeout: 15000 
        });
        
        console.log('✅ Página carregada!');
        
        // Screenshot inicial
        await page.screenshot({ path: 'spidertv-inicial.png' });
        console.log('📸 Screenshot inicial salvo');
        
        // Aguardar 5 segundos
        await page.waitForTimeout(5000);
        
        // Procurar campo de email
        console.log('🔍 Procurando campo de email...');
        const emailField = await page.$('input[type="email"], input[name="email"]');
        
        if (emailField) {
            console.log('✅ Campo de email encontrado!');
            await emailField.type('eidergoncalves@gmail.com', { delay: 100 });
            
            // Procurar campo de senha
            const passwordField = await page.$('input[type="password"]');
            if (passwordField) {
                console.log('✅ Campo de senha encontrado!');
                await passwordField.type('Goncalves1', { delay: 100 });
                
                // Screenshot com campos preenchidos
                await page.screenshot({ path: 'spidertv-preenchido.png' });
                console.log('📸 Campos preenchidos');
                
                // Procurar botão de login
                const loginButton = await page.$('button[type="submit"], button:contains("Login")');
                if (loginButton) {
                    console.log('✅ Botão de login encontrado!');
                    await loginButton.click();
                    
                    // Aguardar navegação
                    await page.waitForTimeout(5000);
                    
                    // Screenshot após login
                    await page.screenshot({ path: 'spidertv-apos-login.png' });
                    console.log('📸 Screenshot após login');
                    
                    console.log('🎉 Processo de login concluído!');
                }
            }
        } else {
            console.log('❌ Campo de email não encontrado');
            
            // Listar todos os inputs
            const inputs = await page.$$('input');
            console.log(`📝 Encontrados ${inputs.length} inputs na página`);
        }
        
        // Aguardar 20 segundos para inspeção
        console.log('👀 Aguardando 20 segundos para inspeção...');
        await page.waitForTimeout(20000);
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        if (browser) {
            await browser.close();
            console.log('✅ Navegador fechado');
        }
    }
}

loginSpiderTV().catch(console.error);
