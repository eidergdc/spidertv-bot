/**
 * Bot SpiderTV - Renovar Cliente 648718886 (Versão Rápida)
 */

const puppeteer = require('puppeteer');

console.log('🕷️ Bot SpiderTV - Renovar Cliente 648718886 (RÁPIDO)');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function renovarCliente() {
    let browser;
    
    try {
        console.log('🚀 Lançando Chromium...');
        
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 200, // Mais rápido
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
        await sleep(2000);
        
        // ETAPA 1: LOGIN RÁPIDO
        console.log('\n=== ETAPA 1: LOGIN RÁPIDO ===');
        
        // Aguardar campos aparecerem
        await page.waitForSelector('input', { timeout: 10000 });
        
        // Campo de usuário - COLAR DIRETO
        const userField = await page.$('input[type="text"]');
        if (userField) {
            console.log('👤 Colando usuário: tropicalplay');
            await userField.click();
            await sleep(200);
            
            // Limpar campo e colar
            await userField.click({ clickCount: 3 });
            await page.evaluate((element, value) => {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, userField, 'tropicalplay');
        }
        
        // Campo de senha - COLAR DIRETO
        const passwordField = await page.$('input[type="password"]');
        if (passwordField) {
            console.log('🔒 Colando senha: Virginia13');
            await passwordField.click();
            await sleep(200);
            
            // Limpar campo e colar
            await passwordField.click({ clickCount: 3 });
            await page.evaluate((element, value) => {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, passwordField, 'Virginia13');
        }
        
        await sleep(1000);
        
        // Screenshot com campos preenchidos
        await page.screenshot({ path: 'renovacao-rapida-648718886-login.png', fullPage: true });
        console.log('📸 Screenshot do login');
        
        // Botão de login
        const loginButton = await page.$('button[type="submit"]');
        if (loginButton) {
            console.log('🔄 Clicando no botão de login...');
            await loginButton.click();
            
            // Aguardar redirecionamento
            console.log('⏳ Aguardando redirecionamento...');
            await sleep(4000);
            
            const newUrl = page.url();
            console.log('🌐 URL após login:', newUrl);
            
            if (newUrl.includes('/dashboard')) {
                console.log('🎉 LOGIN REALIZADO COM SUCESSO!');
                
                // ETAPA 2: NAVEGAR PARA CLIENTES
                console.log('\n=== ETAPA 2: NAVEGANDO PARA CLIENTES ===');
                
                console.log('🌐 Navegando para página de clientes...');
                await page.goto('https://spidertv.sigma.st/#/customers', { 
                    waitUntil: 'networkidle0',
                    timeout: 30000 
                });
                
                console.log('✅ Página de clientes carregada!');
                await sleep(3000);
                
                // ETAPA 3: BUSCAR CLIENTE 648718886 RÁPIDO
                console.log('\n=== ETAPA 3: BUSCA RÁPIDA DO CLIENTE 648718886 ===');
                
                try {
                    const searchSelector = 'input[type="text"][placeholder="Pesquisar"]';
                    await page.waitForSelector(searchSelector, { timeout: 10000 });
                    
                    const searchField = await page.$(searchSelector);
                    
                    if (searchField) {
                        console.log('✅ Campo de pesquisa encontrado!');
                        
                        // Clicar no campo
                        await searchField.click();
                        await sleep(300);
                        
                        // COLAR O ID DIRETO
                        console.log('🔍 Colando ID do cliente: 648718886');
                        await page.evaluate((element, value) => {
                            element.value = value;
                            element.dispatchEvent(new Event('input', { bubbles: true }));
                        }, searchField, '648718886');
                        
                        // Pressionar Enter
                        console.log('⏎ Pressionando Enter para buscar...');
                        await searchField.press('Enter');
                        
                        // Aguardar resultados
                        console.log('⏳ Aguardando resultados da busca...');
                        await sleep(4000);
                        
                        // Screenshot da busca
                        await page.screenshot({ path: 'renovacao-rapida-648718886-busca.png', fullPage: true });
                        console.log('📸 Screenshot da busca do cliente');
                        
                        // ETAPA 4: PROCURAR RENOVAÇÃO
                        console.log('\n=== ETAPA 4: PROCURANDO RENOVAÇÃO ===');
                        
                        // Aguardar um pouco mais
                        await sleep(2000);
                        
                        // Procurar por elementos de ação na tabela
                        console.log('🔍 Procurando botões de ação...');
                        
                        // Seletores mais específicos
                        const actionSelectors = [
                            'button[title*="Renovar" i]',
                            'a[title*="Renovar" i]',
                            'button[title*="Renew" i]',
                            'a[title*="Renew" i]',
                            'i.fa-refresh',
                            'i.fa-sync',
                            'i.fa-redo',
                            'i.fa-rotate',
                            '.btn-sm',
                            '.btn-outline-primary',
                            '.btn-outline-success'
                        ];
                        
                        let actionElement = null;
                        for (const selector of actionSelectors) {
                            try {
                                const elements = await page.$$(selector);
                                if (elements.length > 0) {
                                    console.log(`✅ Encontrados ${elements.length} elementos: ${selector}`);
                                    actionElement = elements[0]; // Pegar o primeiro
                                    break;
                                }
                            } catch (e) {
                                // Continuar
                            }
                        }
                        
                        // Se não encontrou, procurar por qualquer botão na linha do resultado
                        if (!actionElement) {
                            console.log('🔍 Procurando qualquer botão na linha do resultado...');
                            
                            const allButtons = await page.$$('button, a');
                            console.log(`🔘 Total de botões/links encontrados: ${allButtons.length}`);
                            
                            // Procurar botões que podem ser de ação
                            for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
                                try {
                                    const button = allButtons[i];
                                    const text = await button.textContent();
                                    const title = await button.getAttribute('title');
                                    const className = await button.getAttribute('class');
                                    
                                    console.log(`  Botão ${i + 1}: text="${text}", title="${title}", class="${className}"`);
                                    
                                    // Se encontrar algo relacionado a renovação
                                    if (title && (
                                        title.toLowerCase().includes('renovar') ||
                                        title.toLowerCase().includes('renew') ||
                                        title.toLowerCase().includes('extend')
                                    )) {
                                        console.log(`✅ Botão de renovação identificado: "${title}"`);
                                        actionElement = button;
                                        break;
                                    }
                                    
                                    // Ou se for um botão pequeno (provavelmente de ação)
                                    if (className && className.includes('btn-sm')) {
                                        console.log(`✅ Botão de ação identificado: class="${className}"`);
                                        actionElement = button;
                                        break;
                                    }
                                } catch (e) {
                                    // Continuar
                                }
                            }
                        }
                        
                        if (actionElement) {
                            console.log('🔄 Clicando no elemento de ação...');
                            
                            try {
                                // Scroll para o elemento
                                await page.evaluate((element) => {
                                    element.scrollIntoView();
                                }, actionElement);
                                
                                await sleep(500);
                                
                                // Clicar
                                await actionElement.click();
                                
                                console.log('✅ Clique realizado!');
                                
                                // Aguardar modal ou nova página
                                await sleep(4000);
                                
                                // Screenshot após clicar
                                await page.screenshot({ path: 'renovacao-rapida-648718886-acao.png', fullPage: true });
                                console.log('📸 Screenshot após ação');
                                
                                // ETAPA 5: CONFIRMAR RENOVAÇÃO
                                console.log('\n=== ETAPA 5: CONFIRMANDO RENOVAÇÃO ===');
                                
                                // Procurar por seletor de período ou botão direto
                                const confirmSelectors = [
                                    'button:has-text("1 mês")',
                                    'button:has-text("1 month")',
                                    'select[name*="month" i]',
                                    'input[value="1"]',
                                    'button:has-text("Confirmar")',
                                    'button:has-text("Confirm")',
                                    'button:has-text("Renovar")',
                                    'button:has-text("Renew")',
                                    'button[type="submit"]',
                                    '.btn-primary',
                                    '.btn-success'
                                ];
                                
                                let confirmElement = null;
                                for (const selector of confirmSelectors) {
                                    try {
                                        confirmElement = await page.$(selector);
                                        if (confirmElement) {
                                            console.log(`✅ Elemento de confirmação encontrado: ${selector}`);
                                            break;
                                        }
                                    } catch (e) {
                                        // Continuar
                                    }
                                }
                                
                                if (confirmElement) {
                                    console.log('🔄 Clicando para confirmar...');
                                    await confirmElement.click();
                                    
                                    // Aguardar processamento
                                    await sleep(5000);
                                    
                                    // Screenshot final
                                    await page.screenshot({ path: 'renovacao-rapida-648718886-final.png', fullPage: true });
                                    console.log('📸 Screenshot final');
                                    
                                    console.log('🎉 RENOVAÇÃO DO CLIENTE 648718886 PROCESSADA!');
                                } else {
                                    console.log('❌ Elemento de confirmação não encontrado');
                                    
                                    // Listar elementos disponíveis
                                    const modalButtons = await page.$$('button');
                                    console.log(`🔘 Botões disponíveis no modal: ${modalButtons.length}`);
                                    
                                    for (let i = 0; i < Math.min(modalButtons.length, 8); i++) {
                                        try {
                                            const text = await modalButtons[i].textContent();
                                            const className = await modalButtons[i].getAttribute('class');
                                            console.log(`  Modal Botão ${i + 1}: "${text}" (class: ${className})`);
                                        } catch (e) {
                                            // Continuar
                                        }
                                    }
                                }
                                
                            } catch (clickError) {
                                console.error('❌ Erro ao clicar:', clickError.message);
                            }
                            
                        } else {
                            console.log('❌ Nenhum elemento de ação encontrado');
                        }
                        
                    } else {
                        console.log('❌ Campo de pesquisa não encontrado');
                    }
                    
                } catch (searchError) {
                    console.log('❌ Erro na busca:', searchError.message);
                }
                
            } else {
                console.log('❌ Login falhou');
            }
        }
        
        // Aguardar 30 segundos para inspeção
        console.log('\n👀 Mantendo navegador aberto por 30 segundos...');
        await sleep(30000);
        
        console.log('🎉 Processo finalizado!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        if (browser) {
            try {
                const page = (await browser.pages())[0];
                if (page) {
                    await page.screenshot({ path: 'renovacao-rapida-648718886-erro.png', fullPage: true });
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

renovarCliente().catch(console.error);
