/**
 * Bot SpiderTV com proteção anti-detecção
 */

const puppeteer = require('puppeteer');

console.log('🕷️ Bot SpiderTV - Modo Stealth (Anti-Detecção)');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loginSpiderTV() {
    let browser;
    
    try {
        console.log('🚀 Lançando Chromium com proteções anti-detecção...');
        
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 1000, // Bem devagar para parecer humano
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled', // Remove sinais de automação
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        });
        
        console.log('✅ Chromium lançado!');
        
        const page = await browser.newPage();
        
        // Configurações anti-detecção
        await page.evaluateOnNewDocument(() => {
            // Remove webdriver property
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            
            // Sobrescreve plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
            
            // Sobrescreve languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['pt-BR', 'pt', 'en'],
            });
            
            // Remove chrome runtime
            window.chrome = {
                runtime: {}
            };
            
            // Sobrescreve permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Cypress.denied }) :
                    originalQuery(parameters)
            );
        });
        
        await page.setViewport({ width: 1280, height: 720 });
        
        // User agent mais realista
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Headers extras para parecer mais humano
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        });
        
        console.log('🌐 Navegando para SpiderTV (com delay humano)...');
        
        // Navegar com timeout maior
        await page.goto('https://spidertv.sigma.st', { 
            waitUntil: 'networkidle0', // Aguardar rede ficar idle
            timeout: 30000 
        });
        
        console.log('✅ Página carregada!');
        
        // Aguardar um tempo aleatório (comportamento humano)
        const randomDelay = Math.random() * 3000 + 2000; // 2-5 segundos
        console.log(`⏳ Aguardando ${Math.round(randomDelay/1000)}s (comportamento humano)...`);
        await sleep(randomDelay);
        
        // Screenshot inicial
        await page.screenshot({ path: 'spidertv-stealth-inicial.png', fullPage: true });
        console.log('📸 Screenshot inicial salvo');
        
        // Verificar se a página carregou corretamente
        const title = await page.title();
        const url = page.url();
        console.log('📄 Título:', title);
        console.log('🌐 URL atual:', url);
        
        // Verificar se há proteção Cloudflare
        const cloudflareCheck = await page.$('.cf-browser-verification, .cf-checking-browser, #cf-wrapper');
        if (cloudflareCheck) {
            console.log('🛡️ Proteção Cloudflare detectada! Aguardando...');
            await sleep(10000); // Aguardar verificação
            
            // Screenshot após Cloudflare
            await page.screenshot({ path: 'spidertv-pos-cloudflare.png', fullPage: true });
            console.log('📸 Screenshot pós-Cloudflare');
        }
        
        // Simular movimento do mouse (comportamento humano)
        console.log('🖱️ Simulando movimento humano do mouse...');
        await page.mouse.move(100, 100);
        await sleep(500);
        await page.mouse.move(200, 200);
        await sleep(500);
        
        // Procurar campos de login
        console.log('🔍 Procurando campos de login...');
        
        const inputs = await page.$$('input');
        console.log(`📝 Encontrados ${inputs.length} inputs`);
        
        // Aguardar campos aparecerem
        try {
            await page.waitForSelector('input[type="email"], input[name="email"], input[type="text"]', { timeout: 10000 });
            console.log('✅ Campos de input detectados!');
        } catch (e) {
            console.log('⚠️ Timeout aguardando campos, continuando...');
        }
        
        // Procurar campo de email com seletores mais amplos
        const emailSelectors = [
            'input[type="email"]',
            'input[name="email"]',
            'input[placeholder*="email" i]',
            'input[placeholder*="usuário" i]',
            'input[placeholder*="user" i]',
            'input[type="text"]:first-of-type'
        ];
        
        let emailField = null;
        for (const selector of emailSelectors) {
            emailField = await page.$(selector);
            if (emailField) {
                console.log(`✅ Campo de email encontrado com seletor: ${selector}`);
                break;
            }
        }
        
        if (emailField) {
            // Simular clique humano
            await page.evaluate((element) => {
                element.scrollIntoView();
            }, emailField);
            
            await sleep(1000);
            await emailField.click();
            await sleep(500);
            
            // Digitar com delay humano
            console.log('📧 Digitando email...');
            await emailField.type('eidergoncalves@gmail.com', { delay: 150 });
            
            // Procurar campo de senha
            const passwordField = await page.$('input[type="password"]');
            
            if (passwordField) {
                console.log('✅ Campo de senha encontrado!');
                
                await sleep(1000);
                await passwordField.click();
                await sleep(500);
                
                console.log('🔒 Digitando senha...');
                await passwordField.type('Goncalves1', { delay: 150 });
                
                // Screenshot com campos preenchidos
                await page.screenshot({ path: 'spidertv-stealth-preenchido.png', fullPage: true });
                console.log('📸 Campos preenchidos');
                
                // Aguardar antes de clicar no botão
                await sleep(2000);
                
                // Procurar botão de login
                const loginSelectors = [
                    'button[type="submit"]',
                    'input[type="submit"]',
                    'button:has-text("Login")',
                    'button:has-text("Entrar")',
                    'button:has-text("Sign in")',
                    '.btn-login',
                    '#login-button'
                ];
                
                let loginButton = null;
                for (const selector of loginSelectors) {
                    try {
                        loginButton = await page.$(selector);
                        if (loginButton) {
                            console.log(`✅ Botão de login encontrado: ${selector}`);
                            break;
                        }
                    } catch (e) {
                        // Continuar tentando
                    }
                }
                
                if (loginButton) {
                    console.log('🔄 Clicando no botão de login...');
                    await loginButton.click();
                    
                    // Aguardar resposta
                    console.log('⏳ Aguardando resposta do login...');
                    await sleep(5000);
                    
                    // Screenshot após login
                    await page.screenshot({ path: 'spidertv-stealth-apos-login.png', fullPage: true });
                    console.log('📸 Screenshot após login');
                    
                    const newUrl = page.url();
                    console.log('🌐 Nova URL:', newUrl);
                    
                    if (newUrl !== 'https://spidertv.sigma.st' && !newUrl.includes('/login')) {
                        console.log('🎉 LOGIN REALIZADO COM SUCESSO!');
                        
                        // Aguardar dashboard carregar
                        await sleep(3000);
                        
                        // Procurar cliente 364572675
                        console.log('🔍 Procurando cliente 364572675...');
                        
                        const searchField = await page.$('input[type="search"], input[placeholder*="search" i], input[placeholder*="buscar" i], input[name="search"]');
                        
                        if (searchField) {
                            console.log('✅ Campo de busca encontrado!');
                            await searchField.click();
                            await sleep(500);
                            await searchField.type('364572675', { delay: 100 });
                            await searchField.press('Enter');
                            
                            await sleep(3000);
                            
                            // Screenshot da busca
                            await page.screenshot({ path: 'spidertv-stealth-busca.png', fullPage: true });
                            console.log('📸 Screenshot da busca do cliente');
                        }
                        
                    } else {
                        console.log('❌ Login pode ter falhado');
                    }
                    
                } else {
                    console.log('❌ Botão de login não encontrado');
                    
                    // Listar todos os botões
                    const buttons = await page.$$('button');
                    console.log(`🔘 Encontrados ${buttons.length} botões na página`);
                    
                    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
                        const text = await buttons[i].textContent();
                        console.log(`  Botão ${i + 1}: "${text}"`);
                    }
                }
                
            } else {
                console.log('❌ Campo de senha não encontrado');
            }
            
        } else {
            console.log('❌ Campo de email não encontrado');
            
            // Debug: listar todos os inputs
            for (let i = 0; i < Math.min(inputs.length, 10); i++) {
                const input = inputs[i];
                const type = await input.getAttribute('type');
                const name = await input.getAttribute('name');
                const placeholder = await input.getAttribute('placeholder');
                console.log(`  Input ${i + 1}: type="${type}", name="${name}", placeholder="${placeholder}"`);
            }
        }
        
        // Aguardar 20 segundos para inspeção manual
        console.log('👀 Mantendo navegador aberto por 20 segundos para inspeção...');
        await sleep(20000);
        
        console.log('🎉 Processo concluído!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        if (browser) {
            try {
                const page = (await browser.pages())[0];
                if (page) {
                    await page.screenshot({ path: 'spidertv-stealth-erro.png', fullPage: true });
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

loginSpiderTV().catch(console.error);
