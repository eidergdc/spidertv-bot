/**
 * Teste das Correções do Dropdown - Servidor 2 (SpiderTV)
 * 
 * Testa as melhorias implementadas no dropdown de seleção de planos
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
        default: prefix = '📝'; break;
    }
    
    console.log(`[${timestamp}] 🕷️ SpiderTV ${prefix} ${mensagem}`);
}

async function testeDropdownCorrigido(clienteId, meses) {
    console.log('🧪 TESTE DAS CORREÇÕES DO DROPDOWN - SERVIDOR 2');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: ${meses} meses`);
    console.log(`🔧 Testando melhorias implementadas`);
    console.log('='.repeat(60));
    
    let browser;
    let page;
    
    try {
        // Lançar navegador
        log('Lançando navegador para teste...', 'test');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
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
            
            // TESTAR AS MELHORIAS DO DROPDOWN
            log('🔧 TESTANDO MELHORIAS DO DROPDOWN', 'test');
            
            // Mapeamento de IDs de planos conhecidos
            const planIds = {
                1: 'plan_1_month',
                3: 'bOxLAQLZ7a', // ID conhecido para 3 meses
                6: 'plan_6_months',
                12: 'plan_12_months'
            };
            
            // Teste 1: Procurar dropdown com múltiplos seletores
            log('Teste 1: Procurando dropdown com seletores melhorados...', 'test');
            let packageDropdown = await page.$('[data-test="package_id"]');
            
            if (!packageDropdown) {
                log('Dropdown principal não encontrado, testando seletores alternativos...', 'warning');
                const alternativeSelectors = [
                    '.el-select',
                    'select[name="package_id"]',
                    'select[name="plan"]',
                    '[data-plan-selector]',
                    '.plan-selector'
                ];
                
                for (const selector of alternativeSelectors) {
                    packageDropdown = await page.$(selector);
                    if (packageDropdown) {
                        log(`✅ Dropdown encontrado com seletor: ${selector}`, 'success');
                        break;
                    }
                }
            } else {
                log('✅ Dropdown encontrado com seletor principal!', 'success');
            }
            
            if (packageDropdown) {
                // Teste 2: Abertura melhorada do dropdown
                log('Teste 2: Testando abertura melhorada do dropdown...', 'test');
                await sleep(1000);
                
                try {
                    await packageDropdown.click();
                    log('✅ Dropdown aberto com clique normal', 'success');
                } catch (error) {
                    log('Clique normal falhou, tentando JavaScript...', 'warning');
                    await page.evaluate(el => el.click(), packageDropdown);
                    log('✅ Dropdown aberto com JavaScript', 'success');
                }
                
                await sleep(2000);
                
                // Teste 3: Aguardar opções carregarem
                log('Teste 3: Aguardando opções do dropdown carregarem...', 'test');
                try {
                    await page.waitForSelector('.el-select-dropdown__item, .el-option', { timeout: 5000 });
                    log('✅ Opções do dropdown carregadas!', 'success');
                } catch (error) {
                    log('⚠️ Timeout aguardando opções, continuando...', 'warning');
                }
                
                // Teste 4: Estratégia de seleção por ID
                log(`Teste 4: Testando seleção por ID específico (${meses} meses)...`, 'test');
                const planId = planIds[meses];
                let opcaoSelecionada = false;
                
                if (planId) {
                    log(`Procurando por ID: ${planId}`, 'test');
                    const planElement = await page.$(`[data-plan-id="${planId}"], [value="${planId}"], [data-value="${planId}"]`);
                    if (planElement) {
                        log(`✅ Plano encontrado por ID: ${planId}`, 'success');
                        await planElement.click();
                        await sleep(1000);
                        opcaoSelecionada = true;
                    } else {
                        log('ID específico não encontrado, testando busca em elementos...', 'test');
                        const allElements = await page.$$('.el-select-dropdown__item, .el-option, option, button, div');
                        for (const element of allElements) {
                            const elementData = await page.evaluate(el => ({
                                text: el.textContent?.trim() || '',
                                value: el.value || '',
                                dataValue: el.getAttribute('data-value') || '',
                                dataPlanId: el.getAttribute('data-plan-id') || '',
                                innerHTML: el.innerHTML || ''
                            }), element);
                            
                            if (elementData.value === planId || 
                                elementData.dataValue === planId || 
                                elementData.dataPlanId === planId ||
                                elementData.innerHTML.includes(planId)) {
                                log(`✅ Plano encontrado por ID em elemento: ${elementData.text || elementData.value}`, 'success');
                                await element.click();
                                await sleep(1000);
                                opcaoSelecionada = true;
                                break;
                            }
                        }
                    }
                }
                
                // Teste 5: Estratégia de seleção por texto (se ID falhou)
                if (!opcaoSelecionada) {
                    log(`Teste 5: Testando seleção por texto (${meses} meses)...`, 'test');
                    
                    const opcoes = await page.evaluate(() => {
                        const options = document.querySelectorAll('.el-select-dropdown__item, .el-option, option');
                        return Array.from(options).map((option, index) => ({
                            index,
                            text: option.textContent?.trim() || '',
                            value: option.getAttribute('data-value') || option.value || '',
                            visible: option.offsetParent !== null
                        })).filter(opt => opt.visible && opt.text.length > 0);
                    });
                    
                    if (opcoes.length > 0) {
                        log(`Encontradas ${opcoes.length} opções:`, 'test');
                        opcoes.forEach((opcao, i) => {
                            console.log(`   ${i + 1}. "${opcao.text}" (valor: "${opcao.value}")`);
                        });
                        
                        const optionElements = await page.$$('.el-select-dropdown__item, .el-option, option');
                        
                        for (let i = 0; i < optionElements.length; i++) {
                            const option = optionElements[i];
                            const text = await page.evaluate(el => el.textContent?.trim() || '', option);
                            
                            const isCorrectPlan = 
                                (meses === 1 && (text.includes('1') && (text.includes('mês') || text.includes('month') || text.includes('MENSAL')))) ||
                                (meses === 3 && (text.includes('3') && (text.includes('mês') || text.includes('month') || text.includes('TRIMESTRAL') || text.includes('TRIMESTRE')))) ||
                                (meses === 6 && (text.includes('6') && (text.includes('mês') || text.includes('month') || text.includes('SEMESTRAL') || text.includes('SEMESTRE')))) ||
                                (meses === 12 && (text.includes('12') && (text.includes('mês') || text.includes('month') || text.includes('ANUAL') || text.includes('ANO'))));
                            
                            if (isCorrectPlan) {
                                log(`✅ Opção encontrada por texto: "${text}"`, 'success');
                                try {
                                    await option.click();
                                } catch (error) {
                                    await page.evaluate(el => el.click(), option);
                                }
                                await sleep(1000);
                                opcaoSelecionada = true;
                                break;
                            }
                        }
                    }
                }
                
                // Teste 6: Verificação de seleção
                if (opcaoSelecionada) {
                    log('Teste 6: Verificando se a seleção foi bem-sucedida...', 'test');
                    await sleep(1000);
                    
                    const selectedValue = await page.evaluate(() => {
                        const dropdown = document.querySelector('[data-test="package_id"], .el-select');
                        if (dropdown) {
                            const selectedText = dropdown.textContent?.trim() || '';
                            const selectedValue = dropdown.value || dropdown.getAttribute('data-value') || '';
                            return { text: selectedText, value: selectedValue };
                        }
                        return null;
                    });
                    
                    if (selectedValue) {
                        log(`✅ Seleção confirmada - Texto: "${selectedValue.text}", Valor: "${selectedValue.value}"`, 'success');
                    } else {
                        log('⚠️ Não foi possível verificar a seleção', 'warning');
                    }
                } else {
                    log(`❌ Falha ao selecionar opção para ${meses} meses`, 'error');
                }
                
            } else {
                log('❌ Dropdown não encontrado com nenhum seletor', 'error');
            }
            
            // Manter navegador aberto para análise
            log('Mantendo navegador aberto por 30 segundos para análise...', 'test');
            await sleep(30000);
            
        } else {
            throw new Error('Botão de renovação não encontrado');
        }
        
        console.log('');
        console.log('🎉 TESTE DAS CORREÇÕES CONCLUÍDO!');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: ${meses} meses`);
        
    } catch (error) {
        log(`Erro no teste: ${error.message}`, 'error');
        console.log('');
        console.log('❌ TESTE FALHOU');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`❌ Erro: ${error.message}`);
    } finally {
        if (browser) {
            log('Fechando navegador...', 'test');
            await browser.close();
            log('Navegador fechado');
        }
        
        console.log('');
        console.log('🏁 TESTE FINALIZADO!');
    }
}

// Validação de argumentos
const clienteId = process.argv[2];
const meses = parseInt(process.argv[3]) || 3;

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node teste-dropdown-corrigido.cjs <cliente_id> <meses>');
    console.log('📖 Exemplo: node teste-dropdown-corrigido.cjs 359503850 3');
    process.exit(1);
}

if (![1, 3, 6, 12].includes(meses)) {
    console.log('❌ Erro: Período deve ser 1, 3, 6 ou 12 meses');
    process.exit(1);
}

// Executar teste
testeDropdownCorrigido(clienteId, meses).catch(console.error);
