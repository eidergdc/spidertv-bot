/**
 * Bot Servidor 3 (Premium Server) - Versão Melhorada
 * Link: https://premiumserver.sigma.st/#/sign-in
 * Usuário: eidergdc
 * Senha: Premium2025@
 */

const puppeteer = require('puppeteer');

console.log('🕷️ Bot Servidor 3 (Premium Server) - Versão Melhorada');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function renovarClienteServidor3Melhorado(clienteId = '648718886') {
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
        
        console.log('🌐 Navegando para Premium Server...');
        await page.goto('https://premiumserver.sigma.st/#/sign-in', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        console.log('✅ Página carregada!');
        await sleep(3000);
        
        // ETAPA 1: LOGIN RÁPIDO
        console.log('\n=== ETAPA 1: LOGIN NO SERVIDOR 3 ===');
        
        await page.waitForSelector('input', { timeout: 10000 });
        
        // Campo de usuário/email - COLAR DIRETO
        const userField = await page.$('input[type="text"], input[type="email"]');
        if (userField) {
            console.log('👤 Colando usuário: eidergdc');
            await userField.click();
            await sleep(200);
            await page.evaluate((element, value) => {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, userField, 'eidergdc');
        }
        
        // Campo de senha - COLAR DIRETO
        const passwordField = await page.$('input[type="password"]');
        if (passwordField) {
            console.log('🔒 Colando senha: Premium2025@');
            await passwordField.click();
            await sleep(200);
            await page.evaluate((element, value) => {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, passwordField, 'Premium2025@');
        }
        
        await sleep(1000);
        
        // Botão de login
        const loginButton = await page.$('button[type="submit"]');
        if (loginButton) {
            console.log('🔄 Fazendo login no Servidor 3...');
            await loginButton.click();
            await sleep(4000);
            
            const newUrl = page.url();
            console.log('🌐 URL após login:', newUrl);
            
            if (newUrl.includes('/dashboard')) {
                console.log('🎉 LOGIN NO SERVIDOR 3 REALIZADO COM SUCESSO!');
                
                // ETAPA 2: NAVEGAR PARA CLIENTES
                console.log('\n=== ETAPA 2: NAVEGANDO PARA CLIENTES ===');
                
                await page.goto('https://premiumserver.sigma.st/#/customers', { 
                    waitUntil: 'networkidle0',
                    timeout: 30000 
                });
                
                console.log('✅ Página de clientes carregada!');
                await sleep(3000);
                
                // ETAPA 3: BUSCAR CLIENTE
                console.log(`\n=== ETAPA 3: BUSCANDO CLIENTE ${clienteId} ===`);
                
                const searchSelector = 'input[type="text"][placeholder="Pesquisar"]';
                await page.waitForSelector(searchSelector, { timeout: 10000 });
                
                const searchField = await page.$(searchSelector);
                if (searchField) {
                    console.log('✅ Campo de pesquisa encontrado!');
                    
                    await searchField.click();
                    await sleep(300);
                    
                    console.log(`🔍 Colando ID do cliente: ${clienteId}`);
                    await page.evaluate((element, value) => {
                        element.value = value;
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                    }, searchField, clienteId);
                    
                    console.log('⏎ Pressionando Enter para buscar...');
                    await searchField.press('Enter');
                    
                    console.log('⏳ Aguardando resultados da busca...');
                    await sleep(4000);
                    
                    // ETAPA 4: PROCURAR TODOS OS BOTÕES DE AÇÃO
                    console.log('\n=== ETAPA 4: ANALISANDO BOTÕES DE AÇÃO ===');
                    
                    // Procurar por todos os botões na linha do cliente
                    const actionButtons = await page.$$('button, a');
                    console.log(`🔘 Total de botões/links encontrados: ${actionButtons.length}`);
                    
                    // Analisar cada botão para encontrar o de renovação
                    let renewButton = null;
                    for (let i = 0; i < actionButtons.length; i++) {
                        try {
                            const button = actionButtons[i];
                            const text = await page.evaluate(el => el.textContent || '', button);
                            const title = await page.evaluate(el => el.title || '', button);
                            const className = await page.evaluate(el => el.className || '', button);
                            const innerHTML = await page.evaluate(el => el.innerHTML || '', button);
                            
                            console.log(`🔘 Botão ${i + 1}:`);
                            console.log(`   Texto: "${text.trim()}"`);
                            console.log(`   Title: "${title}"`);
                            console.log(`   Class: "${className}"`);
                            
                            // Procurar por indicadores de renovação
                            if (
                                text.toLowerCase().includes('renovar') ||
                                text.toLowerCase().includes('renew') ||
                                title.toLowerCase().includes('renovar') ||
                                title.toLowerCase().includes('renew') ||
                                innerHTML.includes('fa-calendar-plus') ||
                                innerHTML.includes('calendar-plus') ||
                                className.includes('btn-warning')
                            ) {
                                console.log(`✅ BOTÃO DE RENOVAÇÃO IDENTIFICADO: Botão ${i + 1}`);
                                renewButton = button;
                                break;
                            }
                        } catch (e) {
                            console.log(`⚠️ Erro ao analisar botão ${i + 1}: ${e.message}`);
                        }
                    }
                    
                    if (renewButton) {
                        console.log('\n=== ETAPA 5: CLICANDO NO BOTÃO DE RENOVAÇÃO ===');
                        
                        // Scroll para o botão
                        await page.evaluate((element) => {
                            element.scrollIntoView();
                        }, renewButton);
                        
                        await sleep(1000);
                        
                        console.log('🔄 Clicando no botão de renovação...');
                        await renewButton.click();
                        
                        console.log('✅ Clique realizado!');
                        
                        // Aguardar modal ou nova página
                        await sleep(5000);
                        
                        // ETAPA 6: PROCURAR MODAL DE RENOVAÇÃO
                        console.log('\n=== ETAPA 6: PROCURANDO MODAL DE RENOVAÇÃO ===');
                        
                        // Screenshot após clicar
                        await page.screenshot({ path: 'servidor3-apos-clique.png', fullPage: true });
                        console.log('📸 Screenshot após clique');
                        
                        // Procurar por modais
                        const modalSelectors = [
                            '#renewModal',
                            '.modal.show',
                            '.modal[style*="display: block"]',
                            '[role="dialog"]',
                            '.modal-dialog'
                        ];
                        
                        let modalFound = false;
                        for (const selector of modalSelectors) {
                            try {
                                const modal = await page.$(selector);
                                if (modal) {
                                    console.log(`✅ Modal encontrado: ${selector}`);
                                    modalFound = true;
                                    
                                    // Procurar botões dentro do modal
                                    const modalButtons = await page.$$(`${selector} button`);
                                    console.log(`🔘 Botões no modal: ${modalButtons.length}`);
                                    
                                    for (let j = 0; j < modalButtons.length; j++) {
                                        try {
                                            const modalButton = modalButtons[j];
                                            const buttonText = await page.evaluate(el => el.textContent || '', modalButton);
                                            const buttonType = await page.evaluate(el => el.type || '', modalButton);
                                            const buttonClass = await page.evaluate(el => el.className || '', modalButton);
                                            
                                            console.log(`   Modal Botão ${j + 1}: "${buttonText.trim()}" (type: ${buttonType}, class: ${buttonClass})`);
                                            
                                            // Se encontrar botão de renovar/confirmar
                                            if (
                                                buttonText.toLowerCase().includes('renovar') ||
                                                buttonText.toLowerCase().includes('renew') ||
                                                buttonText.toLowerCase().includes('confirmar') ||
                                                buttonText.toLowerCase().includes('confirm') ||
                                                buttonType === 'submit' ||
                                                buttonClass.includes('btn-primary') ||
                                                buttonClass.includes('btn-success')
                                            ) {
                                                console.log(`✅ BOTÃO DE CONFIRMAÇÃO ENCONTRADO: "${buttonText.trim()}"`);
                                                
                                                console.log('🔄 Clicando no botão de confirmação...');
                                                await modalButton.click();
                                                
                                                console.log('✅ RENOVAÇÃO CONFIRMADA!');
                                                
                                                // Aguardar processamento
                                                await sleep(5000);
                                                
                                                // Screenshot final
                                                await page.screenshot({ path: 'servidor3-renovacao-sucesso.png', fullPage: true });
                                                console.log('📸 Screenshot final');
                                                
                                                console.log('🎉 RENOVAÇÃO NO SERVIDOR 3 REALIZADA COM SUCESSO!');
                                                break;
                                            }
                                        } catch (e) {
                                            console.log(`⚠️ Erro ao analisar botão do modal ${j + 1}: ${e.message}`);
                                        }
                                    }
                                    break;
                                }
                            } catch (e) {
                                continue;
                            }
                        }
                        
                        if (!modalFound) {
                            console.log('❌ Nenhum modal encontrado');
                            console.log('ℹ️ Pode ser que a renovação tenha sido processada diretamente');
                        }
                        
                    } else {
                        console.log('❌ Botão de renovação não encontrado');
                        console.log('💡 Vamos tentar procurar por ícones específicos...');
                        
                        // Procurar especificamente por ícones
                        const icons = await page.$$('i');
                        console.log(`🔍 Total de ícones encontrados: ${icons.length}`);
                        
                        for (let k = 0; k < Math.min(icons.length, 20); k++) {
                            try {
                                const icon = icons[k];
                                const iconClass = await page.evaluate(el => el.className || '', icon);
                                
                                if (iconClass.includes('calendar') || iconClass.includes('plus')) {
                                    console.log(`✅ Ícone interessante encontrado: "${iconClass}"`);
                                    
                                    // Tentar clicar no pai do ícone
                                    const parentButton = await page.evaluateHandle(el => el.parentElement, icon);
                                    await parentButton.click();
                                    console.log('🔄 Clicou no botão pai do ícone!');
                                    break;
                                }
                            } catch (e) {
                                continue;
                            }
                        }
                    }
                    
                } else {
                    console.log('❌ Campo de pesquisa não encontrado');
                }
                
            } else {
                console.log('❌ Login falhou - não redirecionou para dashboard');
                console.log(`🌐 URL atual: ${newUrl}`);
            }
        }
        
        // Aguardar 45 segundos para inspeção manual
        console.log('\n👀 Mantendo navegador aberto por 45 segundos para inspeção manual...');
        await sleep(45000);
        
        console.log('🎉 PROCESSO NO SERVIDOR 3 FINALIZADO!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        if (browser) {
            try {
                const page = (await browser.pages())[0];
                if (page) {
                    await page.screenshot({ path: 'servidor3-erro-melhorado.png', fullPage: true });
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

// Permitir passar o ID do cliente como argumento
const clienteId = process.argv[2] || '648718886';
console.log(`🎯 Cliente a ser renovado: ${clienteId}`);

renovarClienteServidor3Melhorado(clienteId).catch(console.error);
