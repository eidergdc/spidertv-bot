/**
 * Renovação Servidor 2 - Versão Final com Dropdown
 * 
 * Usa o dropdown correto identificado: data-test="package_id"
 * Suporta seleção de diferentes planos (1, 3, 6, 12 meses)
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

async function renovarComDropdown(clienteId, meses) {
    console.log('📋 RENOVAÇÃO SERVIDOR 2 - VERSÃO DROPDOWN FINAL');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: ${meses} meses`);
    console.log(`🎯 Dropdown alvo: data-test="package_id"`);
    console.log('='.repeat(60));
    
    let browser;
    let page;
    
    try {
        // Lançar navegador
        log('Lançando navegador...');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 150,
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
        log('Fazendo login...');
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
        log('Navegando para página de clientes...');
        await page.goto('https://spidertv.sigma.st/#/customers', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(3000);
        
        // Buscar cliente
        log(`Buscando cliente ${clienteId}...`);
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[type="search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId, { delay: 80 });
            await page.keyboard.press('Enter');
            await sleep(4000);
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
                await sleep(3000);
                clienteFound = true;
                break;
            }
        }
        
        if (!clienteFound) {
            throw new Error(`Cliente ${clienteId} não encontrado`);
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
            await sleep(3000);
            
            // TRABALHAR COM O DROPDOWN DE PLANOS - VERSÃO MELHORADA
            log('Procurando dropdown de planos...', 'info');
            
            // Mapeamento de IDs de planos conhecidos
            const planIds = {
                1: 'plan_1_month',
                3: 'bOxLAQLZ7a', // ID conhecido para 3 meses
                6: 'qK4WrQDeNj', // ID conhecido para 6 meses
                12: 'plan_12_months'
            };
            
            // Estratégia 1: Procurar pelo dropdown específico de pacotes
            let packageDropdown = await page.$('[data-test="package_id"]');
            
            // Fallback: procurar por outros seletores de dropdown
            if (!packageDropdown) {
                log('Dropdown principal não encontrado, tentando seletores alternativos...', 'warning');
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
                        log(`Dropdown encontrado com seletor: ${selector}`, 'success');
                        break;
                    }
                }
            }
            
            if (packageDropdown) {
                log('Dropdown de planos encontrado!', 'success');
                
                // Aguardar um pouco para garantir que o dropdown está pronto
                await sleep(1000);
                
                // Clicar no dropdown para abrir as opções
                log('Abrindo dropdown de planos...');
                try {
                    await packageDropdown.click();
                } catch (error) {
                    log('Clique normal falhou, tentando JavaScript...', 'warning');
                    await page.evaluate(el => el.click(), packageDropdown);
                }
                
                // Aguardar as opções carregarem
                await sleep(2000);
                
                // Aguardar especificamente pelas opções do dropdown aparecerem
                try {
                    await page.waitForSelector('.el-select-dropdown__item, .el-option', { timeout: 5000 });
                    log('Opções do dropdown carregadas!', 'success');
                } catch (error) {
                    log('Timeout aguardando opções, continuando mesmo assim...', 'warning');
                }
                
                // ESTRATÉGIA 1: Tentar seleção por ID específico do plano
                log(`Estratégia 1: Procurando por ID específico do plano (${meses} meses)...`);
                const planId = planIds[meses];
                let opcaoSelecionada = false;
                
                if (planId) {
                    const planElement = await page.$(`[data-plan-id="${planId}"], [value="${planId}"], [data-value="${planId}"]`);
                    if (planElement) {
                        log(`Plano encontrado por ID: ${planId}`, 'success');
                        await planElement.click();
                        await sleep(1000);
                        opcaoSelecionada = true;
                    } else {
                        // Procurar em todos os elementos por ID no texto/atributos
                        try {
                            const allElements = await page.$$('.el-select-dropdown__item, .el-option, option, button, div');
                            for (const element of allElements) {
                                try {
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
                                        log(`Plano encontrado por ID em elemento: ${elementData.text || elementData.value}`, 'success');
                                        await element.click();
                                        await sleep(1000);
                                        opcaoSelecionada = true;
                                        break;
                                    }
                                } catch (elementError) {
                                    // Continuar com próximo elemento se houver erro
                                    continue;
                                }
                            }
                        } catch (searchError) {
                            log(`Erro na busca por elementos: ${searchError.message}`, 'warning');
                        }
                    }
                }
                
                // ESTRATÉGIA 2: Seleção por texto (se ID não funcionou)
                if (!opcaoSelecionada) {
                    log(`Estratégia 2: Procurando por texto (${meses} meses)...`);
                    
                    // Capturar todas as opções disponíveis primeiro
                    const opcoes = await page.evaluate(() => {
                        const options = document.querySelectorAll('.el-select-dropdown__item, .el-option, option');
                        return Array.from(options).map((option, index) => ({
                            index,
                            text: option.textContent?.trim() || '',
                            value: option.getAttribute('data-value') || option.value || '',
                            className: option.className,
                            visible: option.offsetParent !== null,
                            outerHTML: option.outerHTML.substring(0, 200) + '...'
                        })).filter(opt => opt.visible && opt.text.length > 0);
                    });
                    
                    if (opcoes.length > 0) {
                        log(`Encontradas ${opcoes.length} opções no dropdown:`, 'success');
                        opcoes.forEach((opcao, i) => {
                            console.log(`   ${i + 1}. "${opcao.text}" (valor: "${opcao.value}")`);
                        });
                        
                        const optionElements = await page.$$('.el-select-dropdown__item, .el-option, option');
                        
                        // Para 6 meses, procurar especificamente pelo span "PLANO COMPLETO - SEMESTRAL"
                        if (meses === 6) {
                            log('Procurando especificamente por span "PLANO COMPLETO - SEMESTRAL"...', 'success');
                            
                            // Procurar pelo span específico
                            const semestralSpan = await page.$('span:contains("PLANO COMPLETO - SEMESTRAL")');
                            if (semestralSpan) {
                                log('✅ Span "PLANO COMPLETO - SEMESTRAL" encontrado!', 'success');
                                
                                try {
                                    await semestralSpan.click();
                                    log('✅ Clique no span "PLANO COMPLETO - SEMESTRAL" realizado', 'success');
                                } catch (error) {
                                    log('Clique normal falhou, tentando JavaScript...', 'warning');
                                    await page.evaluate(el => el.click(), semestralSpan);
                                    log('✅ Clique JavaScript no span realizado', 'success');
                                }
                                await sleep(1500);
                                opcaoSelecionada = true;
                            } else {
                                // Fallback: procurar em todos os elementos
                                log('Span não encontrado, procurando em elementos do dropdown...', 'warning');
                                
                                for (let i = 0; i < optionElements.length; i++) {
                                    const option = optionElements[i];
                                    
                                    // Procurar por span dentro do elemento
                                    const hasSpan = await page.evaluate(el => {
                                        const span = el.querySelector('span');
                                        return span && span.textContent?.trim() === 'PLANO COMPLETO - SEMESTRAL';
                                    }, option);
                                    
                                    if (hasSpan) {
                                        log(`✅ Encontrado span "PLANO COMPLETO - SEMESTRAL" no elemento ${i + 1}`, 'success');
                                        
                                        try {
                                            await option.click();
                                            log('✅ Clique no elemento com span realizado', 'success');
                                        } catch (error) {
                                            log('Clique normal falhou, tentando JavaScript...', 'warning');
                                            await page.evaluate(el => el.click(), option);
                                            log('✅ Clique JavaScript no elemento realizado', 'success');
                                        }
                                        await sleep(1500);
                                        opcaoSelecionada = true;
                                        break;
                                    }
                                }
                            }
                            
                            if (!opcaoSelecionada) {
                                log('❌ Span "PLANO COMPLETO - SEMESTRAL" não encontrado, tentando fallback...', 'warning');
                            }
                        } else {
                            // Para outros períodos, usar busca por texto
                            for (let i = 0; i < optionElements.length; i++) {
                                const option = optionElements[i];
                                const text = await page.evaluate(el => el.textContent?.trim() || '', option);
                                
                                // Critérios para outros períodos
                                const isCorrectPlan = 
                                    (meses === 1 && (text.includes('7 dias') || text.includes('Plano de 7 dias'))) ||
                                    (meses === 3 && (text.includes('PLANO COMPLETO - TRIMESTRAL') || text.includes('TRIMESTRAL'))) ||
                                    (meses === 12 && (text.includes('PLANO COMPLETO - ANUAL') || text.includes('ANUAL')));
                                
                                if (isCorrectPlan) {
                                    log(`Opção encontrada por texto: "${text}"`, 'success');
                                    try {
                                        await option.click();
                                    } catch (error) {
                                        log('Clique normal falhou, tentando JavaScript...', 'warning');
                                        await page.evaluate(el => el.click(), option);
                                    }
                                    await sleep(1000);
                                    opcaoSelecionada = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                
                // ESTRATÉGIA 3: Seleção por posição (último recurso)
                if (!opcaoSelecionada) {
                    log(`Estratégia 3: Seleção por posição (${meses} meses)...`, 'warning');
                    
                    // Mapeamento de posições conhecidas (baseado na informação do usuário)
                    const positionMap = {
                        1: 0,  // primeira opção
                        3: 1,  // segunda opção
                        6: 5,  // sexta opção (6ª posição no dropdown)
                        12: 3  // quarta opção
                    };
                    
                    const position = positionMap[meses];
                    if (position !== undefined) {
                        const optionElements = await page.$$('.el-select-dropdown__item, .el-option, option');
                        if (optionElements[position]) {
                            const text = await page.evaluate(el => el.textContent?.trim() || '', optionElements[position]);
                            log(`Selecionando opção na posição ${position}: "${text}"`, 'warning');
                            try {
                                await optionElements[position].click();
                            } catch (error) {
                                await page.evaluate(el => el.click(), optionElements[position]);
                            }
                            await sleep(1000);
                            opcaoSelecionada = true;
                        }
                    }
                }
                
                // Verificar se a seleção foi bem-sucedida
                if (opcaoSelecionada) {
                    log('Verificando se a seleção foi bem-sucedida...', 'info');
                    await sleep(2000);
                    
                    // Verificar se o plano correto foi selecionado
                    const selectedValue = await page.evaluate(() => {
                        // Procurar pelo texto selecionado no dropdown
                        const selectedSpan = document.querySelector('.el-select__selected-item span, .el-select__placeholder');
                        const dropdownText = selectedSpan ? selectedSpan.textContent?.trim() : '';
                        
                        // Procurar também por informações de créditos
                        const creditInfo = document.querySelector('.text-primary');
                        const creditText = creditInfo ? creditInfo.textContent?.trim() : '';
                        
                        return { 
                            selectedPlan: dropdownText, 
                            creditInfo: creditText,
                            hasCredits: creditText.includes('créditos')
                        };
                    });
                    
                    if (selectedValue.selectedPlan) {
                        log(`✅ Plano selecionado: "${selectedValue.selectedPlan}"`, 'success');
                        if (selectedValue.hasCredits) {
                            log(`💰 Informação de créditos: "${selectedValue.creditInfo}"`, 'success');
                        }
                        
                        // Verificar se é o plano correto para o período
                        const isCorrectPlan = 
                            (meses === 6 && selectedValue.selectedPlan.includes('SEMESTRAL')) ||
                            (meses === 3 && selectedValue.selectedPlan.includes('TRIMESTRAL')) ||
                            (meses === 12 && selectedValue.selectedPlan.includes('ANUAL')) ||
                            (meses === 1 && selectedValue.selectedPlan.includes('7 dias'));
                        
                        if (isCorrectPlan) {
                            log(`✅ Plano correto selecionado para ${meses} meses!`, 'success');
                        } else {
                            log(`⚠️ ATENÇÃO: Plano selecionado pode não corresponder a ${meses} meses`, 'warning');
                        }
                    } else {
                        log('⚠️ Não foi possível verificar a seleção', 'warning');
                    }
                } else {
                    log(`❌ Falha ao selecionar opção para ${meses} meses`, 'error');
                }
                
            } else {
                log('Dropdown de planos não encontrado com nenhum seletor', 'error');
            }
            
            // Confirmar renovação
            log('Procurando botão de confirmação...');
            const confirmBtn = await page.$('button.btn.btn-lg.btn-primary[type="submit"]');
            if (confirmBtn) {
                const btnText = await page.evaluate(btn => btn.textContent?.trim() || '', confirmBtn);
                if (btnText.includes('Renovar')) {
                    log(`Confirmando renovação: "${btnText}"`, 'info');
                    await confirmBtn.click();
                    await sleep(3000);
                    
                    // Verificar resultado
                    log('Verificando resultado...', 'info');
                    await sleep(2000);
                    
                    log('Renovação processada com sucesso!', 'success');
                } else {
                    log(`Botão encontrado mas texto inesperado: "${btnText}"`, 'warning');
                }
            } else {
                log('Botão de confirmação não encontrado', 'warning');
            }
            
        } else {
            throw new Error('Botão de renovação não encontrado');
        }
        
        // Manter navegador aberto para análise
        log('Mantendo navegador aberto por 20 segundos...', 'info');
        await sleep(20000);
        
        console.log('');
        console.log('🎉 RENOVAÇÃO REALIZADA COM SUCESSO!');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: ${meses} meses`);
        
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
        console.log('🏁 TESTE FINALIZADO!');
    }
}

// Validação de argumentos
const clienteId = process.argv[2];
const meses = parseInt(process.argv[3]) || 3;

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node renovar-servidor2-dropdown-final.cjs <cliente_id> <meses>');
    console.log('📖 Exemplo: node renovar-servidor2-dropdown-final.cjs 359503850 6');
    process.exit(1);
}

if (![1, 3, 6, 12].includes(meses)) {
    console.log('❌ Erro: Período deve ser 1, 3, 6 ou 12 meses');
    process.exit(1);
}

// Executar renovação
renovarComDropdown(clienteId, meses).catch(console.error);
