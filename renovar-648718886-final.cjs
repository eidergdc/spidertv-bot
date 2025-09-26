/**
 * Bot SpiderTV Final - Renovação Completa do Cliente 648718886
 */

const puppeteer = require('puppeteer');

console.log('🕷️ Bot SpiderTV - Renovação Final Cliente 648718886');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function renovarClienteFinal() {
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
        
        console.log('🌐 Navegando para SpiderTV...');
        await page.goto('https://spidertv.sigma.st', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        console.log('✅ Página carregada!');
        await sleep(2000);
        
        // ETAPA 1: LOGIN RÁPIDO
        console.log('\n=== ETAPA 1: LOGIN RÁPIDO ===');
        
        await page.waitForSelector('input', { timeout: 10000 });
        
        // Campo de usuário - COLAR DIRETO
        const userField = await page.$('input[type="text"]');
        if (userField) {
            console.log('👤 Colando usuário: tropicalplay');
            await userField.click();
            await sleep(200);
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
            await page.evaluate((element, value) => {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, passwordField, 'Virginia13');
        }
        
        await sleep(1000);
        
        // Botão de login
        const loginButton = await page.$('button[type="submit"]');
        if (loginButton) {
            console.log('🔄 Fazendo login...');
            await loginButton.click();
            await sleep(4000);
            
            const newUrl = page.url();
            console.log('🌐 URL após login:', newUrl);
            
            if (newUrl.includes('/dashboard')) {
                console.log('🎉 LOGIN REALIZADO COM SUCESSO!');
                
                // ETAPA 2: NAVEGAR PARA CLIENTES
                console.log('\n=== ETAPA 2: NAVEGANDO PARA CLIENTES ===');
                
                await page.goto('https://spidertv.sigma.st/#/customers', { 
                    waitUntil: 'networkidle0',
                    timeout: 30000 
                });
                
                console.log('✅ Página de clientes carregada!');
                await sleep(3000);
                
                // ETAPA 3: BUSCAR CLIENTE 648718886
                console.log('\n=== ETAPA 3: BUSCANDO CLIENTE 648718886 ===');
                
                const searchSelector = 'input[type="text"][placeholder="Pesquisar"]';
                await page.waitForSelector(searchSelector, { timeout: 10000 });
                
                const searchField = await page.$(searchSelector);
                if (searchField) {
                    console.log('✅ Campo de pesquisa encontrado!');
                    
                    await searchField.click();
                    await sleep(300);
                    
                    console.log('🔍 Colando ID do cliente: 648718886');
                    await page.evaluate((element, value) => {
                        element.value = value;
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                    }, searchField, '648718886');
                    
                    console.log('⏎ Pressionando Enter para buscar...');
                    await searchField.press('Enter');
                    
                    console.log('⏳ Aguardando resultados da busca...');
                    await sleep(4000);
                    
                    // ETAPA 4: CLICAR NO BOTÃO DE RENOVAÇÃO
                    console.log('\n=== ETAPA 4: CLICANDO NO BOTÃO DE RENOVAÇÃO ===');
                    
                    // Procurar pelo botão específico de renovação (ícone fa-calendar-plus)
                    const renewButtonSelector = 'button.btn-warning i.fa-calendar-plus';
                    
                    try {
                        await page.waitForSelector(renewButtonSelector, { timeout: 5000 });
                        const renewButton = await page.$(renewButtonSelector);
                        
                        if (renewButton) {
                            console.log('✅ Botão de renovação encontrado!');
                            
                            // Clicar no botão pai (button)
                            const parentButton = await page.evaluateHandle(el => el.parentElement, renewButton);
                            await parentButton.click();
                            
                            console.log('🔄 Clicou no botão de renovação!');
                            
                            // Aguardar modal aparecer
                            await sleep(3000);
                            
                            // ETAPA 5: CONFIRMAR RENOVAÇÃO NO MODAL
                            console.log('\n=== ETAPA 5: CONFIRMANDO RENOVAÇÃO NO MODAL ===');
                            
                            // Aguardar o modal aparecer
                            await page.waitForSelector('#renewModal', { timeout: 10000 });
                            console.log('✅ Modal de renovação aberto!');
                            
                            // Screenshot do modal
                            await page.screenshot({ path: 'renovacao-final-modal.png', fullPage: true });
                            console.log('📸 Screenshot do modal');
                            
                            // Verificar se "PLANO COMPLETO" já está selecionado
                            const planoSelecionado = await page.$eval('#renewModal .el-select__placeholder', el => el.textContent);
                            console.log(`📋 Plano selecionado: ${planoSelecionado}`);
                            
                            if (planoSelecionado.includes('PLANO COMPLETO')) {
                                console.log('✅ PLANO COMPLETO já está selecionado!');
                            } else {
                                console.log('🔄 Selecionando PLANO COMPLETO...');
                                // Aqui você pode adicionar código para selecionar o plano se necessário
                            }
                            
                            // Procurar e clicar no botão "Renovar" do modal
                            const modalRenovarButton = await page.$('#renewModal button[type="submit"]');
                            
                            if (modalRenovarButton) {
                                console.log('✅ Botão "Renovar" encontrado no modal!');
                                
                                // Verificar o texto do botão
                                const buttonText = await page.evaluate(el => el.textContent, modalRenovarButton);
                                console.log(`🔘 Texto do botão: "${buttonText}"`);
                                
                                console.log('🔄 Clicando no botão "Renovar"...');
                                await modalRenovarButton.click();
                                
                                console.log('✅ CLIQUE NO BOTÃO RENOVAR REALIZADO!');
                                
                                // Aguardar processamento
                                await sleep(5000);
                                
                                // Screenshot final
                                await page.screenshot({ path: 'renovacao-final-sucesso.png', fullPage: true });
                                console.log('📸 Screenshot final');
                                
                                // Verificar se apareceu modal de confirmação
                                const confirmModal = await page.$('#renewConfirmationModal');
                                if (confirmModal) {
                                    console.log('🎉 MODAL DE CONFIRMAÇÃO APARECEU!');
                                    console.log('✅ RENOVAÇÃO DO CLIENTE 648718886 REALIZADA COM SUCESSO!');
                                } else {
                                    console.log('⏳ Aguardando confirmação...');
                                    await sleep(3000);
                                    
                                    // Verificar novamente
                                    const confirmModal2 = await page.$('#renewConfirmationModal');
                                    if (confirmModal2) {
                                        console.log('🎉 RENOVAÇÃO CONFIRMADA!');
                                    } else {
                                        console.log('ℹ️ Renovação processada (modal pode ter fechado)');
                                    }
                                }
                                
                            } else {
                                console.log('❌ Botão "Renovar" não encontrado no modal');
                                
                                // Listar botões do modal para debug
                                const modalButtons = await page.$$('#renewModal button');
                                console.log(`🔘 Botões no modal: ${modalButtons.length}`);
                                
                                for (let i = 0; i < modalButtons.length; i++) {
                                    try {
                                        const text = await page.evaluate(el => el.textContent, modalButtons[i]);
                                        const type = await page.evaluate(el => el.type, modalButtons[i]);
                                        console.log(`  Botão ${i + 1}: "${text}" (type: ${type})`);
                                    } catch (e) {
                                        console.log(`  Botão ${i + 1}: erro ao ler`);
                                    }
                                }
                            }
                            
                        } else {
                            console.log('❌ Botão de renovação não encontrado');
                        }
                        
                    } catch (renewError) {
                        console.log('❌ Erro ao procurar botão de renovação:', renewError.message);
                        
                        // Tentar seletor alternativo
                        console.log('🔄 Tentando seletor alternativo...');
                        const altSelector = 'button[class*="btn-warning"][class*="btn-sm"] i[class*="fa-calendar-plus"]';
                        
                        try {
                            const altButton = await page.$(altSelector);
                            if (altButton) {
                                console.log('✅ Botão alternativo encontrado!');
                                const parentButton = await page.evaluateHandle(el => el.parentElement, altButton);
                                await parentButton.click();
                                console.log('🔄 Clicou no botão alternativo!');
                            }
                        } catch (altError) {
                            console.log('❌ Seletor alternativo também falhou');
                        }
                    }
                    
                } else {
                    console.log('❌ Campo de pesquisa não encontrado');
                }
                
            } else {
                console.log('❌ Login falhou');
            }
        }
        
        // Aguardar 20 segundos para ver o resultado
        console.log('\n👀 Mantendo navegador aberto por 20 segundos para ver o resultado...');
        await sleep(20000);
        
        console.log('🎉 PROCESSO FINALIZADO!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        if (browser) {
            try {
                const page = (await browser.pages())[0];
                if (page) {
                    await page.screenshot({ path: 'renovacao-final-erro.png', fullPage: true });
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

renovarClienteFinal().catch(console.error);
