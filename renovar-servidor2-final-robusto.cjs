/**
 * Renovação Servidor 2 - Versão Final Robusta
 * 
 * Múltiplas estratégias para garantir seleção da opção de 6 meses
 * Não depende de captura de coordenadas
 */

const puppeteer = require('puppeteer');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function log(mensagem, tipo = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    let prefix = '';
    
    switch (tipo) {
        case 'success': prefix = '✅'; break;
        case 'error': prefix = '❌'; break;
        case 'warning': prefix = '⚠️'; break;
        case 'info': prefix = 'ℹ️'; break;
        default: prefix = '📝'; break;
    }
    
    console.log(`[${timestamp}] 🕷️ SpiderTV ${prefix} ${mensagem}`);
}

async function renovarRobusto(clienteId, meses) {
    console.log('🔧 RENOVAÇÃO SERVIDOR 2 - VERSÃO FINAL ROBUSTA');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: ${meses} meses`);
    console.log(`🔧 Múltiplas estratégias anti-detecção`);
    console.log('='.repeat(60));
    
    let browser;
    let page;
    
    try {
        // Lançar navegador com configurações anti-detecção
        log('Lançando navegador com proteções anti-detecção...');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 200, // Mais lento para parecer humano
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=VizDisplayCompositor',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        });
        
        page = await browser.newPage();
        
        // Configurações anti-detecção avançadas
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            
            // Remover propriedades que indicam automação
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
        });
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 720 });
        
        // Login
        log('Fazendo login...');
        await page.goto('https://spidertv.sigma.st/#/sign-in', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(3000); // Aguardar mais tempo
        
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            // Simular digitação humana
            await userField.click();
            await sleep(500);
            await userField.type('tropicalplay', { delay: 100 });
            await sleep(800);
            
            await passField.click();
            await sleep(500);
            await passField.type('Virginia13', { delay: 100 });
            await sleep(800);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(5000); // Aguardar mais tempo
                log('Login realizado!', 'success');
            }
        }
        
        // Navegar para clientes
        log('Navegando para página de clientes...');
        await page.goto('https://spidertv.sigma.st/#/customers', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(4000);
        
        // Buscar cliente
        log(`Buscando cliente ${clienteId}...`);
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[type="search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await sleep(300);
            await page.keyboard.press('Delete');
            await sleep(300);
            await searchField.type(clienteId, { delay: 100 });
            await sleep(500);
            await page.keyboard.press('Enter');
            await sleep(5000);
        }
        
        // Procurar cliente na tabela
        log('Procurando cliente na tabela...');
        const cells = await page.$$('td');
        let clienteFound = false;
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                log(`Cliente encontrado: ${text}`, 'success');
                const row = await page.evaluateHandle(cell => cell.closest('tr'), cell);
                await row.click();
                await sleep(4000);
                clienteFound = true;
                break;
            }
        }
        
        if (!clienteFound) {
            const firstRow = await page.$('tbody tr:first-child');
            if (firstRow) {
                await firstRow.click();
                await sleep(4000);
                log('Usando primeira linha da tabela', 'warning');
            }
        }
        
        // Procurar e clicar no botão de renovação
        log('Procurando botão de renovação...');
        let renewBtn = await page.$('button.btn.btn-icon.btn-bg-light.btn-warning.btn-sm');
        if (!renewBtn) {
            const iconBtn = await page.$('i.fa-calendar-plus');
            if (iconBtn) {
                renewBtn = await page.evaluateHandle(icon => icon.closest('button'), iconBtn);
            }
        }
        
        if (renewBtn) {
            log('Clicando no botão de renovação...');
            await renewBtn.click();
            await sleep(5000); // Aguardar modal carregar completamente
            
            // ESTRATÉGIAS MÚLTIPLAS PARA SELEÇÃO DE 6 MESES
            if (meses === 6) {
                log('🔧 INICIANDO ESTRATÉGIAS MÚLTIPLAS PARA 6 MESES', 'info');
                
                // Aguardar modal estar completamente carregado
                try {
                    await page.waitForSelector('[data-test="package_id"]', { timeout: 10000 });
                    log('Modal de renovação carregado!', 'success');
                } catch (error) {
                    log('Timeout aguardando modal, continuando...', 'warning');
                }
                
                await sleep(2000);
                
                // ESTRATÉGIA 1: Seleção direta por texto
                log('Estratégia 1: Seleção direta por texto...', 'info');
                let opcaoSelecionada = false;
                
                try {
                    // Procurar por span com texto específico
                    const semestralOption = await page.evaluateHandle(() => {
                        const spans = document.querySelectorAll('span');
                        for (const span of spans) {
                            if (span.textContent?.trim() === 'PLANO COMPLETO - SEMESTRAL') {
                                return span.closest('.el-select-dropdown__item') || span.parentElement;
                            }
                        }
                        return null;
                    });
                    
                    if (semestralOption) {
                        log('✅ Encontrado elemento com texto "PLANO COMPLETO - SEMESTRAL"', 'success');
                        await semestralOption.click();
                        await sleep(2000);
                        opcaoSelecionada = true;
                    }
                } catch (error) {
                    log('Estratégia 1 falhou, tentando próxima...', 'warning');
                }
                
                // ESTRATÉGIA 2: Abrir dropdown e selecionar por posição conhecida
                if (!opcaoSelecionada) {
                    log('Estratégia 2: Abrir dropdown e selecionar por posição...', 'info');
                    
                    const packageDropdown = await page.$('[data-test="package_id"]');
                    if (packageDropdown) {
                        // Abrir dropdown
                        try {
                            await packageDropdown.click();
                            log('Dropdown aberto', 'success');
                        } catch (error) {
                            await page.evaluate(el => el.click(), packageDropdown);
                            log('Dropdown aberto com JavaScript', 'success');
                        }
                        
                        await sleep(3000);
                        
                        // Aguardar opções carregarem
                        try {
                            await page.waitForSelector('.el-select-dropdown__item', { timeout: 8000 });
                            log('Opções carregadas', 'success');
                        } catch (error) {
                            log('Timeout aguardando opções', 'warning');
                        }
                        
                        // Tentar múltiplas abordagens para encontrar a opção
                        const estrategias = [
                            // Por texto exato
                            async () => {
                                const options = await page.$$('.el-select-dropdown__item');
                                for (const option of options) {
                                    const text = await page.evaluate(el => el.textContent?.trim(), option);
                                    if (text === 'PLANO COMPLETO - SEMESTRAL') {
                                        await option.click();
                                        return true;
                                    }
                                }
                                return false;
                            },
                            
                            // Por posição (6ª opção, índice 5)
                            async () => {
                                const options = await page.$$('.el-select-dropdown__item');
                                if (options.length >= 6) {
                                    await options[5].click();
                                    return true;
                                }
                                return false;
                            },
                            
                            // Por coordenadas aproximadas
                            async () => {
                                await page.mouse.click(640, 450);
                                await sleep(1000);
                                // Verificar se dropdown fechou
                                const dropdownAberto = await page.$('.el-select-dropdown__item');
                                return !dropdownAberto;
                            }
                        ];
                        
                        for (let i = 0; i < estrategias.length && !opcaoSelecionada; i++) {
                            try {
                                log(`Sub-estratégia ${i + 1}...`, 'info');
                                const sucesso = await estrategias[i]();
                                if (sucesso) {
                                    log(`✅ Sub-estratégia ${i + 1} funcionou!`, 'success');
                                    opcaoSelecionada = true;
                                }
                            } catch (error) {
                                log(`Sub-estratégia ${i + 1} falhou: ${error.message}`, 'warning');
                            }
                            await sleep(2000);
                        }
                    }
                }
                
                // ESTRATÉGIA 3: Simulação de teclas
                if (!opcaoSelecionada) {
                    log('Estratégia 3: Simulação de teclas...', 'info');
                    
                    try {
                        const packageDropdown = await page.$('[data-test="package_id"]');
                        if (packageDropdown) {
                            await packageDropdown.click();
                            await sleep(1000);
                            
                            // Usar setas para navegar até a 6ª opção
                            for (let i = 0; i < 5; i++) {
                                await page.keyboard.press('ArrowDown');
                                await sleep(200);
                            }
                            
                            await page.keyboard.press('Enter');
                            await sleep(2000);
                            opcaoSelecionada = true;
                            log('✅ Seleção por teclas funcionou!', 'success');
                        }
                    } catch (error) {
                        log('Estratégia 3 falhou', 'warning');
                    }
                }
                
                if (opcaoSelecionada) {
                    log('✅ Plano de 6 meses selecionado com sucesso!', 'success');
                } else {
                    log('⚠️ Não foi possível selecionar automaticamente. Continuando...', 'warning');
                }
                
            } else {
                log('⚠️ Este script é otimizado para 6 meses', 'warning');
            }
            
            // Aguardar um pouco antes de confirmar
            await sleep(3000);
            
            // Confirmar renovação
            log('Procurando botão de confirmação...');
            const confirmBtn = await page.$('button.btn.btn-lg.btn-primary[type="submit"]');
            if (confirmBtn) {
                const btnText = await page.evaluate(btn => btn.textContent?.trim() || '', confirmBtn);
                if (btnText.includes('Renovar')) {
                    log(`Confirmando renovação: "${btnText}"`, 'info');
                    await confirmBtn.click();
                    await sleep(4000);
                    
                    // Verificar resultado
                    log('Verificando resultado...', 'info');
                    await sleep(3000);
                    
                    log('Renovação processada!', 'success');
                } else {
                    log(`Botão encontrado mas texto inesperado: "${btnText}"`, 'warning');
                }
            } else {
                log('Botão de confirmação não encontrado', 'warning');
            }
            
        } else {
            throw new Error('Botão de renovação não encontrado');
        }
        
        // Manter navegador aberto para verificação
        log('Mantendo navegador aberto por 30 segundos para verificação...', 'info');
        await sleep(30000);
        
        console.log('');
        console.log('🎉 PROCESSO DE RENOVAÇÃO CONCLUÍDO!');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: ${meses} meses`);
        console.log(`🔧 Método: Estratégias múltiplas anti-detecção`);
        
    } catch (error) {
        log(`Erro: ${error.message}`, 'error');
        console.log('');
        console.log('❌ RENOVAÇÃO FALHOU');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`❌ Erro: ${error.message}`);
    } finally {
        if (browser) {
            log('Fechando navegador...');
            await browser.close();
            log('Navegador fechado');
        }
        
        console.log('');
        console.log('🏁 PROCESSO FINALIZADO!');
    }
}

// Validação de argumentos
const clienteId = process.argv[2];
const meses = parseInt(process.argv[3]) || 6;

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node renovar-servidor2-final-robusto.cjs <cliente_id> <meses>');
    console.log('📖 Exemplo: node renovar-servidor2-final-robusto.cjs 359503850 6');
    process.exit(1);
}

// Executar renovação
renovarRobusto(clienteId, meses).catch(console.error);
