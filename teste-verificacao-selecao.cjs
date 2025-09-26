/**
 * Teste de Verificação de Seleção - Servidor 2 (SpiderTV)
 * 
 * Verifica exatamente qual opção está sendo selecionada no dropdown
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
        case 'test': prefix = '🧪'; break;
        case 'verify': prefix = '🔍'; break;
        default: prefix = '📝'; break;
    }
    
    console.log(`[${timestamp}] 🕷️ SpiderTV ${prefix} ${mensagem}`);
}

async function verificarSelecao(clienteId, meses) {
    console.log('🔍 TESTE DE VERIFICAÇÃO DE SELEÇÃO - SERVIDOR 2');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: ${meses} meses`);
    console.log(`🔍 Objetivo: Verificar qual opção está sendo selecionada`);
    console.log('='.repeat(60));
    
    let browser;
    let page;
    
    try {
        // Lançar navegador
        log('Lançando navegador...', 'test');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 200,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });
        
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 720 });
        
        // Login
        log('Fazendo login...', 'test');
        await page.goto('https://spidertv.sigma.st/#/sign-in', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(2000);
        
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            await userField.click();
            await userField.type('tropicalplay', { delay: 80 });
            await sleep(300);
            
            await passField.click();
            await passField.type('Virginia13', { delay: 80 });
            await sleep(300);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(4000);
                log('Login realizado!', 'success');
            }
        }
        
        // Navegar para clientes
        log('Navegando para página de clientes...', 'test');
        await page.goto('https://spidertv.sigma.st/#/customers', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(3000);
        
        // Buscar cliente
        log(`Buscando cliente ${clienteId}...`, 'test');
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[type="search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId, { delay: 80 });
            await page.keyboard.press('Enter');
            await sleep(4000);
        }
        
        // Procurar cliente na tabela
        log('Procurando cliente na tabela...', 'test');
        const cells = await page.$$('td');
        let clienteFound = false;
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                log(`Cliente encontrado: ${text}`, 'success');
                const row = await page.evaluateHandle(cell => cell.closest('tr'), cell);
                await row.click();
                await sleep(3000);
                clienteFound = true;
                break;
            }
        }
        
        if (!clienteFound) {
            const firstRow = await page.$('tbody tr:first-child');
            if (firstRow) {
                await firstRow.click();
                await sleep(3000);
                log('Usando primeira linha da tabela', 'warning');
            }
        }
        
        // Procurar e clicar no botão de renovação
        log('Procurando botão de renovação...', 'test');
        let renewBtn = await page.$('button.btn.btn-icon.btn-bg-light.btn-warning.btn-sm');
        if (!renewBtn) {
            const iconBtn = await page.$('i.fa-calendar-plus');
            if (iconBtn) {
                renewBtn = await page.evaluateHandle(icon => icon.closest('button'), iconBtn);
            }
        }
        
        if (renewBtn) {
            log('Clicando no botão de renovação...', 'test');
            await renewBtn.click();
            await sleep(3000);
            
            // VERIFICAÇÃO DETALHADA DO DROPDOWN
            log('🔍 INICIANDO VERIFICAÇÃO DETALHADA', 'verify');
            
            // 1. Capturar estado inicial
            log('1. Capturando estado inicial do dropdown...', 'verify');
            const estadoInicial = await page.evaluate(() => {
                const dropdown = document.querySelector('[data-test="package_id"]');
                if (dropdown) {
                    const selectedText = dropdown.textContent?.trim() || '';
                    return { selecionado: selectedText };
                }
                return { selecionado: 'Não encontrado' };
            });
            
            log(`Estado inicial: "${estadoInicial.selecionado}"`, 'verify');
            
            // 2. Abrir dropdown
            log('2. Abrindo dropdown...', 'verify');
            const packageDropdown = await page.$('[data-test="package_id"]');
            if (packageDropdown) {
                await packageDropdown.click();
                await sleep(2000);
                
                // 3. Listar todas as opções
                log('3. Listando todas as opções disponíveis...', 'verify');
                const opcoes = await page.evaluate(() => {
                    const options = document.querySelectorAll('.el-select-dropdown__item, .el-option');
                    return Array.from(options).map((option, index) => ({
                        index,
                        text: option.textContent?.trim() || '',
                        visible: option.offsetParent !== null
                    })).filter(opt => opt.visible && opt.text.length > 0);
                });
                
                console.log('\n📋 OPÇÕES DISPONÍVEIS:');
                opcoes.forEach((opcao, i) => {
                    console.log(`   ${i + 1}. "${opcao.text}"`);
                });
                
                // 4. Procurar especificamente por "PLANO COMPLETO - SEMESTRAL"
                log(`4. Procurando especificamente por "PLANO COMPLETO - SEMESTRAL"...`, 'verify');
                const optionElements = await page.$$('.el-select-dropdown__item, .el-option');
                
                let opcaoEncontrada = false;
                for (let i = 0; i < optionElements.length; i++) {
                    const option = optionElements[i];
                    const text = await page.evaluate(el => el.textContent?.trim() || '', option);
                    
                    if (text === 'PLANO COMPLETO - SEMESTRAL') {
                        log(`✅ Encontrado "PLANO COMPLETO - SEMESTRAL" na posição ${i + 1}`, 'verify');
                        
                        try {
                            await option.click();
                            log('✅ Clique em "PLANO COMPLETO - SEMESTRAL" realizado', 'success');
                        } catch (error) {
                            log('Clique normal falhou, tentando JavaScript...', 'warning');
                            await page.evaluate(el => el.click(), option);
                            log('✅ Clique JavaScript em "PLANO COMPLETO - SEMESTRAL" realizado', 'success');
                        }
                        
                        opcaoEncontrada = true;
                        break;
                    }
                }
                
                if (!opcaoEncontrada) {
                    log('❌ "PLANO COMPLETO - SEMESTRAL" não encontrado!', 'error');
                }
                
                await sleep(3000); // Aguardar mais tempo para o dropdown atualizar
                
                if (opcaoEncontrada) {
                    
                    // 5. Verificar estado após seleção com múltiplas tentativas
                    log('5. Verificando estado após seleção...', 'verify');
                    
                    let estadoFinal = null;
                    let tentativas = 0;
                    const maxTentativas = 5;
                    
                    while (tentativas < maxTentativas) {
                        tentativas++;
                        log(`Tentativa ${tentativas} de verificação...`, 'verify');
                        
                        estadoFinal = await page.evaluate(() => {
                            // Múltiplos seletores para encontrar o valor selecionado
                            const selectors = [
                                '[data-test="package_id"]',
                                '.el-select__selected-item',
                                '.el-select input',
                                '.form-control'
                            ];
                            
                            let selectedText = '';
                            for (const selector of selectors) {
                                const element = document.querySelector(selector);
                                if (element) {
                                    selectedText = element.textContent?.trim() || element.value?.trim() || '';
                                    if (selectedText && selectedText !== 'Selecione uma opção' && selectedText !== 'PLANO COMPLETO') {
                                        break;
                                    }
                                }
                            }
                            
                            // Procurar por informações de créditos
                            const creditSelectors = ['.text-primary', '.alert-info', '.text-info'];
                            let creditText = '';
                            for (const selector of creditSelectors) {
                                const element = document.querySelector(selector);
                                if (element && element.textContent?.includes('crédito')) {
                                    creditText = element.textContent?.trim() || '';
                                    break;
                                }
                            }
                            
                            return { 
                                selecionado: selectedText,
                                creditos: creditText
                            };
                        });
                        
                        if (estadoFinal.selecionado.includes('SEMESTRAL') || estadoFinal.creditos.includes('crédito')) {
                            log(`✅ Estado atualizado na tentativa ${tentativas}`, 'success');
                            break;
                        }
                        
                        await sleep(2000); // Aguardar entre tentativas
                    }
                    
                    console.log('\n🔍 RESULTADO DA VERIFICAÇÃO:');
                    console.log(`📋 Estado inicial: "${estadoInicial.selecionado}"`);
                    console.log(`📋 Estado final: "${estadoFinal.selecionado}"`);
                    console.log(`💰 Informação de créditos: "${estadoFinal.creditos}"`);
                    
                    // 6. Verificar se é o plano correto
                    const isCorrectPlan = estadoFinal.selecionado.includes('SEMESTRAL');
                    if (isCorrectPlan) {
                        log('✅ SUCESSO: Plano de 6 meses (SEMESTRAL) selecionado corretamente!', 'success');
                    } else {
                        log('❌ ERRO: Plano incorreto selecionado!', 'error');
                        log(`Esperado: PLANO COMPLETO - SEMESTRAL`, 'error');
                        log(`Obtido: ${estadoFinal.selecionado}`, 'error');
                    }
                    
                } else {
                    log('❌ Menos de 6 opções encontradas no dropdown', 'error');
                }
                
            } else {
                log('❌ Dropdown não encontrado', 'error');
            }
            
            // Manter navegador aberto para análise visual
            log('Mantendo navegador aberto por 30 segundos para análise visual...', 'verify');
            await sleep(30000);
            
        } else {
            throw new Error('Botão de renovação não encontrado');
        }
        
    } catch (error) {
        log(`Erro no teste: ${error.message}`, 'error');
    } finally {
        if (browser) {
            log('Fechando navegador...', 'test');
            await browser.close();
            log('Navegador fechado');
        }
        
        console.log('\n🏁 VERIFICAÇÃO FINALIZADA!');
    }
}

// Validação de argumentos
const clienteId = process.argv[2] || '359503850';
const meses = parseInt(process.argv[3]) || 6;

// Executar verificação
verificarSelecao(clienteId, meses).catch(console.error);
