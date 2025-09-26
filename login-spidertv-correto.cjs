/**
 * Bot SpiderTV com credenciais corretas
 */

const puppeteer = require('puppeteer');

console.log('🕷️ Bot SpiderTV - Credenciais Corretas');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loginSpiderTV() {
    let browser;
    
    try {
        console.log('🚀 Lançando Chromium...');
        
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 800,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security'
            ]
        });
        
        console.log('✅ Chromium lançado!');
        
        const page = await browser.newPage();
        
        // Configurações anti-detecção
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
        
        await page.setViewport({ width: 1280, height: 720 });
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        console.log('🌐 Navegando para SpiderTV...');
        await page.goto('https://spidertv.sigma.st', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        console.log('✅ Página carregada!');
        
        // Aguardar carregamento
        await sleep(3000);
        
        // Screenshot inicial
        await page.screenshot({ path: 'spidertv-correto-inicial.png', fullPage: true });
        console.log('📸 Screenshot inicial salvo');
        
        const title = await page.title();
        const url = page.url();
        console.log('📄 Título:', title);
        console.log('🌐 URL atual:', url);
        
        // Aguardar campos aparecerem
        try {
            await page.waitForSelector('input', { timeout: 10000 });
            console.log('✅ Campos de input detectados!');
        } catch (e) {
            console.log('⚠️ Timeout aguardando campos');
        }
        
        // Procurar campo de usuário/email
        console.log('🔍 Procurando campo de usuário...');
        
        const userSelectors = [
            'input[type="text"]',
            'input[name="username"]',
            'input[name="email"]',
            'input[placeholder*="usuário" i]',
            'input[placeholder*="user" i]',
            'input[placeholder*="email" i]'
        ];
        
        let userField = null;
        for (const selector of userSelectors) {
            userField = await page.$(selector);
            if (userField) {
                console.log(`✅ Campo de usuário encontrado: ${selector}`);
                break;
            }
        }
        
        if (userField) {
            // Clicar e preencher usuário
            await userField.click();
            await sleep(500);
            
            console.log('👤 Digitando usuário: tropicalplay');
            await userField.type('tropicalplay', { delay: 120 });
            
            await sleep(1000);
            
            // Procurar campo de senha
            console.log('🔍 Procurando campo de senha...');
            const passwordField = await page.$('input[type="password"]');
            
            if (passwordField) {
                console.log('✅ Campo de senha encontrado!');
                
                await passwordField.click();
                await sleep(500);
                
                console.log('🔒 Digitando senha: Virginia13');
                await passwordField.type('Virginia13', { delay: 120 });
                
                // Screenshot com campos preenchidos
                await page.screenshot({ path: 'spidertv-correto-preenchido.png', fullPage: true });
                console.log('📸 Campos preenchidos');
                
                await sleep(2000);
                
                // Procurar botão de login
                console.log('🔍 Procurando botão de login...');
                
                const loginSelectors = [
                    'button[type="submit"]',
                    'input[type="submit"]',
                    'button:has-text("Login")',
                    'button:has-text("Entrar")',
                    'button:has-text("Sign in")',
                    '.btn-primary',
                    '.login-btn'
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
                        // Continuar
                    }
                }
                
                if (!loginButton) {
                    // Listar todos os botões
                    const buttons = await page.$$('button');
                    console.log(`🔘 Encontrados ${buttons.length} botões:`);
                    
                    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
                        const text = await buttons[i].textContent();
                        const type = await buttons[i].getAttribute('type');
                        console.log(`  Botão ${i + 1}: "${text}", type="${type}"`);
                        
                        // Se encontrar botão com texto relacionado a login
                        if (text && (text.toLowerCase().includes('login') || 
                                   text.toLowerCase().includes('entrar') || 
                                   text.toLowerCase().includes('sign'))) {
                            loginButton = buttons[i];
                            console.log(`✅ Botão de login identificado: "${text}"`);
                            break;
                        }
                    }
                }
                
                if (loginButton) {
                    console.log('🔄 Clicando no botão de login...');
                    
                    // Tentar clicar
                    try {
                        await loginButton.click();
                        console.log('✅ Clique realizado!');
                        
                        // Aguardar resposta
                        console.log('⏳ Aguardando resposta do login...');
                        await sleep(5000);
                        
                        // Screenshot após login
                        await page.screenshot({ path: 'spidertv-correto-apos-login.png', fullPage: true });
                        console.log('📸 Screenshot após login');
                        
                        const newUrl = page.url();
                        const newTitle = await page.title();
                        
                        console.log('🌐 Nova URL:', newUrl);
                        console.log('📄 Novo título:', newTitle);
                        
                        // Verificar se login foi bem-sucedido
                        if (newUrl !== 'https://spidertv.sigma.st' && 
                            !newUrl.includes('/sign-in') && 
                            !newUrl.includes('/login')) {
                            
                            console.log('🎉 LOGIN REALIZADO COM SUCESSO!');
                            
                            // Aguardar dashboard carregar
                            await sleep(5000);
                            
                            // Procurar cliente 364572675
                            console.log('🔍 Procurando cliente 364572675...');
                            
                            // Procurar campo de busca
                            const searchSelectors = [
                                'input[type="search"]',
                                'input[placeholder*="search" i]',
                                'input[placeholder*="buscar" i]',
                                'input[placeholder*="procurar" i]',
                                'input[name="search"]',
                                '.search-input'
                            ];
                            
                            let searchField = null;
                            for (const selector of searchSelectors) {
                                searchField = await page.$(selector);
                                if (searchField) {
                                    console.log(`✅ Campo de busca encontrado: ${selector}`);
                                    break;
                                }
                            }
                            
                            if (searchField) {
                                await searchField.click();
                                await sleep(500);
                                
                                console.log('🔍 Buscando cliente 364572675...');
                                await searchField.type('364572675', { delay: 100 });
                                
                                // Pressionar Enter ou procurar botão de busca
                                await searchField.press('Enter');
                                
                                await sleep(3000);
                                
                                // Screenshot da busca
                                await page.screenshot({ path: 'spidertv-correto-busca-cliente.png', fullPage: true });
                                console.log('📸 Screenshot da busca do cliente');
                                
                                // Procurar botão de renovação
                                console.log('🔍 Procurando opções de renovação...');
                                
                                const renewSelectors = [
                                    'button:has-text("Renovar")',
                                    'button:has-text("Renew")',
                                    'button:has-text("Extend")',
                                    '.btn-renew',
                                    '.renew-btn'
                                ];
                                
                                let renewButton = null;
                                for (const selector of renewSelectors) {
                                    try {
                                        renewButton = await page.$(selector);
                                        if (renewButton) {
                                            console.log(`✅ Botão de renovação encontrado: ${selector}`);
                                            break;
                                        }
                                    } catch (e) {
                                        // Continuar
                                    }
                                }
                                
                                if (renewButton) {
                                    console.log('🔄 Clicando em renovar...');
                                    await renewButton.click();
                                    
                                    await sleep(3000);
                                    
                                    // Screenshot da renovação
                                    await page.screenshot({ path: 'spidertv-correto-renovacao.png', fullPage: true });
                                    console.log('📸 Screenshot da renovação');
                                    
                                    console.log('🎉 PROCESSO DE RENOVAÇÃO INICIADO!');
                                } else {
                                    console.log('❌ Botão de renovação não encontrado');
                                }
                                
                            } else {
                                console.log('❌ Campo de busca não encontrado');
                                
                                // Listar todos os inputs para debug
                                const allInputs = await page.$$('input');
                                console.log(`📝 Total de inputs na página: ${allInputs.length}`);
                                
                                for (let i = 0; i < Math.min(allInputs.length, 10); i++) {
                                    const input = allInputs[i];
                                    const type = await input.getAttribute('type');
                                    const placeholder = await input.getAttribute('placeholder');
                                    const name = await input.getAttribute('name');
                                    console.log(`  Input ${i + 1}: type="${type}", placeholder="${placeholder}", name="${name}"`);
                                }
                            }
                            
                        } else {
                            console.log('❌ Login pode ter falhado - ainda na página de login');
                        }
                        
                    } catch (clickError) {
                        console.error('❌ Erro ao clicar no botão:', clickError.message);
                    }
                    
                } else {
                    console.log('❌ Botão de login não encontrado');
                }
                
            } else {
                console.log('❌ Campo de senha não encontrado');
            }
            
        } else {
            console.log('❌ Campo de usuário não encontrado');
            
            // Debug: listar todos os inputs
            const allInputs = await page.$$('input');
            console.log(`📝 Total de inputs: ${allInputs.length}`);
            
            for (let i = 0; i < Math.min(allInputs.length, 10); i++) {
                const input = allInputs[i];
                const type = await input.getAttribute('type');
                const name = await input.getAttribute('name');
                const placeholder = await input.getAttribute('placeholder');
                console.log(`  Input ${i + 1}: type="${type}", name="${name}", placeholder="${placeholder}"`);
            }
        }
        
        // Aguardar 30 segundos para inspeção manual
        console.log('👀 Mantendo navegador aberto por 30 segundos para inspeção...');
        await sleep(30000);
        
        console.log('🎉 Processo concluído!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        if (browser) {
            try {
                const page = (await browser.pages())[0];
                if (page) {
                    await page.screenshot({ path: 'spidertv-correto-erro.png', fullPage: true });
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
