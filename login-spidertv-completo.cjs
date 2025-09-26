/**
 * Bot SpiderTV Completo - Login + Navegação + Busca Cliente
 */

const puppeteer = require('puppeteer');

console.log('🕷️ Bot SpiderTV - Processo Completo');

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
        await sleep(3000);
        
        // Screenshot inicial
        await page.screenshot({ path: 'spidertv-completo-inicial.png', fullPage: true });
        console.log('📸 Screenshot inicial salvo');
        
        // ETAPA 1: LOGIN
        console.log('\n=== ETAPA 1: FAZENDO LOGIN ===');
        
        // Aguardar campos aparecerem
        await page.waitForSelector('input', { timeout: 10000 });
        
        // Campo de usuário
        const userField = await page.$('input[type="text"]');
        if (userField) {
            console.log('👤 Preenchendo usuário: tropicalplay');
            await userField.click();
            await sleep(500);
            await userField.type('tropicalplay', { delay: 120 });
        }
        
        // Campo de senha
        const passwordField = await page.$('input[type="password"]');
        if (passwordField) {
            console.log('🔒 Preenchendo senha: Virginia13');
            await passwordField.click();
            await sleep(500);
            await passwordField.type('Virginia13', { delay: 120 });
        }
        
        // Screenshot com campos preenchidos
        await page.screenshot({ path: 'spidertv-completo-preenchido.png', fullPage: true });
        console.log('📸 Campos preenchidos');
        
        await sleep(2000);
        
        // Botão de login
        const loginButton = await page.$('button[type="submit"]');
        if (loginButton) {
            console.log('🔄 Clicando no botão de login...');
            await loginButton.click();
            
            // Aguardar redirecionamento
            console.log('⏳ Aguardando redirecionamento...');
            await sleep(5000);
            
            const newUrl = page.url();
            console.log('🌐 URL após login:', newUrl);
            
            if (newUrl.includes('/dashboard')) {
                console.log('🎉 LOGIN REALIZADO COM SUCESSO!');
                
                // Screenshot do dashboard
                await page.screenshot({ path: 'spidertv-completo-dashboard.png', fullPage: true });
                console.log('📸 Screenshot do dashboard');
                
                // ETAPA 2: NAVEGAR PARA CLIENTES
                console.log('\n=== ETAPA 2: NAVEGANDO PARA CLIENTES ===');
                
                console.log('🌐 Navegando para página de clientes...');
                await page.goto('https://spidertv.sigma.st/#/customers', { 
                    waitUntil: 'networkidle0',
                    timeout: 30000 
                });
                
                console.log('✅ Página de clientes carregada!');
                await sleep(5000);
                
                // Screenshot da página de clientes
                await page.screenshot({ path: 'spidertv-completo-clientes.png', fullPage: true });
                console.log('📸 Screenshot da página de clientes');
                
                // ETAPA 3: BUSCAR CLIENTE
                console.log('\n=== ETAPA 3: BUSCANDO CLIENTE 364572675 ===');
                
                // Aguardar campo de pesquisa aparecer
                console.log('🔍 Aguardando campo de pesquisa...');
                
                try {
                    // Seletor específico fornecido pelo usuário
                    const searchSelector = 'input[type="text"][placeholder="Pesquisar"]';
                    await page.waitForSelector(searchSelector, { timeout: 10000 });
                    
                    const searchField = await page.$(searchSelector);
                    
                    if (searchField) {
                        console.log('✅ Campo de pesquisa encontrado!');
                        
                        // Clicar no campo
                        await searchField.click();
                        await sleep(500);
                        
                        // Limpar campo (caso tenha algo)
                        await searchField.click({ clickCount: 3 });
                        
                        // Digitar o ID do cliente
                        console.log('🔍 Digitando ID do cliente: 364572675');
                        await searchField.type('364572675', { delay: 150 });
                        
                        // Pressionar Enter
                        console.log('⏎ Pressionando Enter para buscar...');
                        await searchField.press('Enter');
                        
                        // Aguardar resultados
                        console.log('⏳ Aguardando resultados da busca...');
                        await sleep(5000);
                        
                        // Screenshot da busca
                        await page.screenshot({ path: 'spidertv-completo-busca.png', fullPage: true });
                        console.log('📸 Screenshot da busca do cliente');
                        
                        // ETAPA 4: PROCURAR OPÇÕES DE RENOVAÇÃO
                        console.log('\n=== ETAPA 4: PROCURANDO OPÇÕES DE RENOVAÇÃO ===');
                        
                        // Procurar por botões de ação na linha do cliente
                        const actionButtons = await page.$$('button, a, .btn');
                        console.log(`🔘 Encontrados ${actionButtons.length} botões/links na página`);
                        
                        // Procurar especificamente por botões de renovação
                        const renewSelectors = [
                            'button:has-text("Renovar")',
                            'button:has-text("Renew")',
                            'button:has-text("Extend")',
                            'a:has-text("Renovar")',
                            '.btn-renew',
                            '.renew-btn',
                            '[title*="Renovar" i]',
                            '[title*="Renew" i]'
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
                                // Continuar tentando
                            }
                        }
                        
                        if (renewButton) {
                            console.log('🔄 Clicando no botão de renovação...');
                            await renewButton.click();
                            
                            await sleep(3000);
                            
                            // Screenshot da tela de renovação
                            await page.screenshot({ path: 'spidertv-completo-renovacao.png', fullPage: true });
                            console.log('📸 Screenshot da tela de renovação');
                            
                            console.log('🎉 PROCESSO DE RENOVAÇÃO INICIADO COM SUCESSO!');
                            
                            // Procurar opção de 1 mês
                            console.log('🔍 Procurando opção de renovação por 1 mês...');
                            
                            const monthOptions = await page.$$('button, select option, input[type="radio"]');
                            for (let i = 0; i < Math.min(monthOptions.length, 10); i++) {
                                try {
                                    const text = await monthOptions[i].textContent();
                                    if (text && (text.includes('1') && (text.includes('mês') || text.includes('month')))) {
                                        console.log(`✅ Opção de 1 mês encontrada: "${text}"`);
                                        await monthOptions[i].click();
                                        await sleep(1000);
                                        break;
                                    }
                                } catch (e) {
                                    // Continuar
                                }
                            }
                            
                            // Screenshot final
                            await page.screenshot({ path: 'spidertv-completo-final.png', fullPage: true });
                            console.log('📸 Screenshot final');
                            
                        } else {
                            console.log('❌ Botão de renovação não encontrado');
                            
                            // Listar alguns botões para debug
                            console.log('🔍 Listando alguns botões disponíveis:');
                            for (let i = 0; i < Math.min(actionButtons.length, 10); i++) {
                                try {
                                    const text = await actionButtons[i].textContent();
                                    const title = await actionButtons[i].getAttribute('title');
                                    console.log(`  Botão ${i + 1}: "${text}" (title: "${title}")`);
                                } catch (e) {
                                    // Continuar
                                }
                            }
                        }
                        
                    } else {
                        console.log('❌ Campo de pesquisa não encontrado');
                    }
                    
                } catch (searchError) {
                    console.log('❌ Erro ao procurar campo de pesquisa:', searchError.message);
                    
                    // Listar todos os inputs para debug
                    const allInputs = await page.$$('input');
                    console.log(`📝 Total de inputs na página: ${allInputs.length}`);
                    
                    for (let i = 0; i < Math.min(allInputs.length, 10); i++) {
                        try {
                            const input = allInputs[i];
                            const type = await input.getAttribute('type');
                            const placeholder = await input.getAttribute('placeholder');
                            const className = await input.getAttribute('class');
                            console.log(`  Input ${i + 1}: type="${type}", placeholder="${placeholder}", class="${className}"`);
                        } catch (e) {
                            // Continuar
                        }
                    }
                }
                
            } else {
                console.log('❌ Login falhou - não redirecionou para dashboard');
            }
        }
        
        // Aguardar 30 segundos para inspeção manual
        console.log('\n👀 Mantendo navegador aberto por 30 segundos para inspeção...');
        await sleep(30000);
        
        console.log('🎉 Processo completo finalizado!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        if (browser) {
            try {
                const page = (await browser.pages())[0];
                if (page) {
                    await page.screenshot({ path: 'spidertv-completo-erro.png', fullPage: true });
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
