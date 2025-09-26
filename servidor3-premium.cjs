/**
 * Bot Servidor 3 (Premium Server) - Renovação de Clientes
 * Link: https://premiumserver.sigma.st/#/sign-in
 * Usuário: eidergdc
 * Senha: Premium2025@
 */

const puppeteer = require('puppeteer');

console.log('🕷️ Bot Servidor 3 (Premium Server) - Sistema de Renovação');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function renovarClienteServidor3(clienteId = '648718886') {
    let browser;
    
    try {
        console.log('🚀 Lançando Chromium...');
        
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 500,
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
        
        // Screenshot inicial
        await page.screenshot({ path: 'servidor3-inicial.png', fullPage: true });
        console.log('📸 Screenshot inicial salvo');
        
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
        
        // Screenshot com campos preenchidos
        await page.screenshot({ path: 'servidor3-login-preenchido.png', fullPage: true });
        console.log('📸 Campos preenchidos');
        
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
                
                // Screenshot do dashboard
                await page.screenshot({ path: 'servidor3-dashboard.png', fullPage: true });
                console.log('📸 Screenshot do dashboard');
                
                // ETAPA 2: NAVEGAR PARA CLIENTES
                console.log('\n=== ETAPA 2: NAVEGANDO PARA CLIENTES ===');
                
                await page.goto('https://premiumserver.sigma.st/#/customers', { 
                    waitUntil: 'networkidle0',
                    timeout: 30000 
                });
                
                console.log('✅ Página de clientes carregada!');
                await sleep(3000);
                
                // Screenshot da página de clientes
                await page.screenshot({ path: 'servidor3-clientes.png', fullPage: true });
                console.log('📸 Screenshot da página de clientes');
                
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
                    
                    // Screenshot da busca
                    await page.screenshot({ path: 'servidor3-busca.png', fullPage: true });
                    console.log('📸 Screenshot da busca');
                    
                    // ETAPA 4: CLICAR NO BOTÃO DE RENOVAÇÃO
                    console.log('\n=== ETAPA 4: PROCURANDO BOTÃO DE RENOVAÇÃO ===');
                    
                    // Procurar pelo ícone de calendário (mesmo padrão do Servidor 2)
                    const renewIconSelector = 'i.fa-calendar-plus';
                    
                    try {
                        await page.waitForSelector(renewIconSelector, { timeout: 5000 });
                        const renewIcon = await page.$(renewIconSelector);
                        
                        if (renewIcon) {
                            console.log('✅ Ícone de renovação encontrado!');
                            
                            // Clicar no botão pai
                            const parentButton = await page.evaluateHandle(el => el.parentElement, renewIcon);
                            await parentButton.click();
                            
                            console.log('🔄 Clicou no botão de renovação!');
                            
                            // Aguardar modal aparecer
                            await sleep(3000);
                            
                            // ETAPA 5: CONFIRMAR RENOVAÇÃO NO MODAL
                            console.log('\n=== ETAPA 5: CONFIRMANDO RENOVAÇÃO NO MODAL ===');
                            
                            // Aguardar o modal aparecer (pode ter ID diferente, vamos tentar vários)
                            const modalSelectors = ['#renewModal', '.modal', '[role="dialog"]'];
                            let modalFound = false;
                            
                            for (const selector of modalSelectors) {
                                try {
                                    await page.waitForSelector(selector, { timeout: 3000 });
                                    console.log(`✅ Modal encontrado: ${selector}`);
                                    modalFound = true;
                                    break;
                                } catch (e) {
                                    continue;
                                }
                            }
                            
                            if (modalFound) {
                                console.log('✅ Modal de renovação aberto!');
                                
                                // Screenshot do modal
                                await page.screenshot({ path: 'servidor3-modal.png', fullPage: true });
                                console.log('📸 Screenshot do modal');
                                
                                // Procurar botão "Renovar" no modal
                                const renewButtonSelectors = [
                                    'button[type="submit"]',
                                    'button:has-text("Renovar")',
                                    'button:has-text("Renew")',
                                    '.btn-primary',
                                    '.btn-success'
                                ];
                                
                                let renewButton = null;
                                for (const selector of renewButtonSelectors) {
                                    try {
                                        renewButton = await page.$(selector);
                                        if (renewButton) {
                                            const buttonText = await page.evaluate(el => el.textContent, renewButton);
                                            if (buttonText.toLowerCase().includes('renovar') || buttonText.toLowerCase().includes('renew')) {
                                                console.log(`✅ Botão "Renovar" encontrado: "${buttonText}"`);
                                                break;
                                            }
                                        }
                                    } catch (e) {
                                        continue;
                                    }
                                }
                                
                                if (renewButton) {
                                    console.log('🔄 Clicando no botão "Renovar"...');
                                    await renewButton.click();
                                    
                                    console.log('✅ CLIQUE NO BOTÃO RENOVAR REALIZADO!');
                                    
                                    // Aguardar processamento
                                    await sleep(5000);
                                    
                                    // Screenshot final
                                    await page.screenshot({ path: 'servidor3-sucesso.png', fullPage: true });
                                    console.log('📸 Screenshot final');
                                    
                                    console.log('🎉 RENOVAÇÃO NO SERVIDOR 3 PROCESSADA COM SUCESSO!');
                                    
                                } else {
                                    console.log('❌ Botão "Renovar" não encontrado no modal');
                                    
                                    // Listar botões do modal para debug
                                    const allButtons = await page.$$('button');
                                    console.log(`🔘 Total de botões na página: ${allButtons.length}`);
                                    
                                    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
                                        try {
                                            const text = await page.evaluate(el => el.textContent, allButtons[i]);
                                            console.log(`  Botão ${i + 1}: "${text}"`);
                                        } catch (e) {
                                            console.log(`  Botão ${i + 1}: erro ao ler`);
                                        }
                                    }
                                }
                                
                            } else {
                                console.log('❌ Modal não encontrado');
                            }
                            
                        } else {
                            console.log('❌ Ícone de renovação não encontrado');
                        }
                        
                    } catch (renewError) {
                        console.log('❌ Erro ao procurar ícone de renovação:', renewError.message);
                        
                        // Tentar seletores alternativos
                        console.log('🔄 Tentando seletores alternativos...');
                        const altSelectors = [
                            'i[class*="calendar"]',
                            'i[class*="plus"]',
                            'button[class*="warning"]',
                            '.btn-warning i'
                        ];
                        
                        for (const altSelector of altSelectors) {
                            try {
                                const altElement = await page.$(altSelector);
                                if (altElement) {
                                    console.log(`✅ Elemento alternativo encontrado: ${altSelector}`);
                                    const parentButton = await page.evaluateHandle(el => el.parentElement, altElement);
                                    await parentButton.click();
                                    console.log('🔄 Clicou no elemento alternativo!');
                                    break;
                                }
                            } catch (altError) {
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
        
        // Aguardar 30 segundos para ver o resultado
        console.log('\n👀 Mantendo navegador aberto por 30 segundos para inspeção...');
        await sleep(30000);
        
        console.log('🎉 PROCESSO NO SERVIDOR 3 FINALIZADO!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        if (browser) {
            try {
                const page = (await browser.pages())[0];
                if (page) {
                    await page.screenshot({ path: 'servidor3-erro.png', fullPage: true });
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

renovarClienteServidor3(clienteId).catch(console.error);
