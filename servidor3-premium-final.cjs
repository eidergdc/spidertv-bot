/**
 * Bot Servidor 3 (Premium Server) - Versão Final
 * Link: https://premiumserver.sigma.st/#/sign-in
 * Usuário: eidergdc
 * Senha: Premium2025@
 * Ícone de renovação: <i class="fad fa-calendar-plus text-white"></i>
 */

const puppeteer = require('puppeteer');

console.log('🕷️ Bot Servidor 3 (Premium Server) - Versão Final');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function renovarClienteServidor3Final(clienteId = '648718886') {
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
                await sleep(5000);
                
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
                    
                    // Screenshot após busca
                    await page.screenshot({ path: 'servidor3-final-busca.png', fullPage: true });
                    console.log('📸 Screenshot da busca');
                    
                    // ETAPA 4: PROCURAR ÍCONE ESPECÍFICO DE RENOVAÇÃO
                    console.log('\n=== ETAPA 4: PROCURANDO ÍCONE DE RENOVAÇÃO ===');
                    
                    // Seletor específico para o ícone fornecido
                    const iconSelector = 'i.fad.fa-calendar-plus.text-white';
                    
                    try {
                        await page.waitForSelector(iconSelector, { timeout: 5000 });
                        const renewIcon = await page.$(iconSelector);
                        
                        if (renewIcon) {
                            console.log('✅ Ícone de renovação encontrado!');
                            
                            // Clicar no botão pai do ícone
                            console.log('🔄 Clicando no botão de renovação...');
                            await page.evaluate((icon) => {
                                const button = icon.closest('button');
                                if (button) {
                                    button.click();
                                } else {
                                    icon.parentElement.click();
                                }
                            }, renewIcon);
                            
                            console.log('✅ Clique no botão de renovação realizado!');
                            
                            // Aguardar modal aparecer
                            await sleep(3000);
                            
                            // ETAPA 5: CONFIRMAR RENOVAÇÃO NO MODAL
                            console.log('\n=== ETAPA 5: CONFIRMANDO RENOVAÇÃO NO MODAL ===');
                            
                            // Screenshot do modal
                            await page.screenshot({ path: 'servidor3-final-modal.png', fullPage: true });
                            console.log('📸 Screenshot do modal');
                            
                            // Procurar por modal e botão de confirmação
                            const modalSelectors = ['#renewModal', '.modal.show', '.modal[style*="display: block"]'];
                            let modalFound = false;
                            
                            for (const modalSelector of modalSelectors) {
                                try {
                                    const modal = await page.$(modalSelector);
                                    if (modal) {
                                        console.log(`✅ Modal encontrado: ${modalSelector}`);
                                        modalFound = true;
                                        
                                        // Procurar botão "Renovar" dentro do modal
                                        const renewButtonSelectors = [
                                            `${modalSelector} button[type="submit"]`,
                                            `${modalSelector} button:has-text("Renovar")`,
                                            `${modalSelector} .btn-primary`,
                                            `${modalSelector} .btn-success`
                                        ];
                                        
                                        let renewButton = null;
                                        for (const btnSelector of renewButtonSelectors) {
                                            try {
                                                renewButton = await page.$(btnSelector);
                                                if (renewButton) {
                                                    const buttonText = await page.evaluate(el => el.textContent, renewButton);
                                                    console.log(`✅ Botão "Renovar" encontrado: "${buttonText.trim()}"`);
                                                    break;
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
                                            await page.screenshot({ path: 'servidor3-final-sucesso.png', fullPage: true });
                                            console.log('📸 Screenshot final');
                                            
                                            console.log('🎉 RENOVAÇÃO NO SERVIDOR 3 REALIZADA COM SUCESSO!');
                                            
                                        } else {
                                            console.log('❌ Botão "Renovar" não encontrado no modal');
                                            
                                            // Listar botões do modal
                                            const modalButtons = await page.$$(`${modalSelector} button`);
                                            console.log(`🔘 Botões no modal: ${modalButtons.length}`);
                                            
                                            for (let i = 0; i < modalButtons.length; i++) {
                                                try {
                                                    const text = await page.evaluate(el => el.textContent, modalButtons[i]);
                                                    console.log(`  Modal Botão ${i + 1}: "${text.trim()}"`);
                                                } catch (e) {
                                                    console.log(`  Modal Botão ${i + 1}: erro ao ler`);
                                                }
                                            }
                                        }
                                        break;
                                    }
                                } catch (e) {
                                    continue;
                                }
                            }
                            
                            if (!modalFound) {
                                console.log('❌ Modal não encontrado');
                                console.log('ℹ️ A renovação pode ter sido processada diretamente');
                            }
                            
                        } else {
                            console.log('❌ Ícone de renovação não encontrado');
                        }
                        
                    } catch (iconError) {
                        console.log('❌ Erro ao procurar ícone:', iconError.message);
                        
                        // Tentar seletores alternativos
                        console.log('🔄 Tentando seletores alternativos...');
                        const altSelectors = [
                            'i[class*="fa-calendar-plus"]',
                            'i.fa-calendar-plus',
                            '.fad.fa-calendar-plus',
                            'button i[class*="calendar-plus"]'
                        ];
                        
                        for (const altSelector of altSelectors) {
                            try {
                                const altIcon = await page.$(altSelector);
                                if (altIcon) {
                                    console.log(`✅ Ícone alternativo encontrado: ${altSelector}`);
                                    await page.evaluate((icon) => {
                                        const button = icon.closest('button');
                                        if (button) {
                                            button.click();
                                        } else {
                                            icon.parentElement.click();
                                        }
                                    }, altIcon);
                                    console.log('🔄 Clicou no ícone alternativo!');
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
        console.log('\n👀 Mantendo navegador aberto por 30 segundos para ver o resultado...');
        await sleep(30000);
        
        console.log('🎉 PROCESSO NO SERVIDOR 3 FINALIZADO!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        if (browser) {
            try {
                const page = (await browser.pages())[0];
                if (page) {
                    await page.screenshot({ path: 'servidor3-final-erro.png', fullPage: true });
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

renovarClienteServidor3Final(clienteId).catch(console.error);
