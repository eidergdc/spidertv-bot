/**
 * Bot Unificado - Renovação nos 3 Servidores
 * 
 * Renova um cliente automaticamente nos 3 servidores:
 * - Servidor 1: TropicalPlayTV (https://painel.tropicalplaytv.com)
 * - Servidor 2: SpiderTV (https://spidertv.sigma.st)
 * - Servidor 3: Premium Server (https://premiumserver.sigma.st)
 *
 * Uso: node renovar-3-servidores.cjs [CLIENTE_ID] [MESES]
 * Exemplo: node renovar-3-servidores.cjs 648718886 1
 * Exemplo: node renovar-3-servidores.cjs 648718886 3
 * Exemplo: node renovar-3-servidores.cjs 648718886 6
 * Exemplo: node renovar-3-servidores.cjs 648718886 12
 */

const puppeteer = require('puppeteer');

// Configurações dos servidores
const SERVIDORES = {
    servidor1: {
        nome: 'TropicalPlayTV',
        url: 'https://painel.tropicalplaytv.com',
        usuario: 'Eider Goncalves',
        senha: 'Goncalves1@',
        emoji: '🌴'
    },
    servidor2: {
        nome: 'SpiderTV',
        url: 'https://spidertv.sigma.st',
        usuario: 'tropicalplay',
        senha: 'Virginia13',
        emoji: '🕷️'
    },
    servidor3: {
        nome: 'Premium Server',
        url: 'https://premiumserver.sigma.st',
        usuario: 'eidergdc',
        senha: 'Premium2025@',
        emoji: '⭐'
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function log(servidor, mensagem, tipo = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = SERVIDORES[servidor]?.emoji || '🤖';
    const nome = SERVIDORES[servidor]?.nome || servidor;
    
    let prefix = '';
    switch (tipo) {
        case 'success': prefix = '✅'; break;
        case 'error': prefix = '❌'; break;
        case 'warning': prefix = '⚠️'; break;
        case 'info': prefix = 'ℹ️'; break;
        default: prefix = '📝'; break;
    }
    
    console.log(`[${timestamp}] ${emoji} ${nome} ${prefix} ${mensagem}`);
}

// Função para obter o plano correto baseado no servidor e meses
function obterPlano(servidor, meses) {
    const planos = {
        servidor2: {
            1: 'PLANO COMPLETO',
            3: 'PLANO COMPLETO - TRIMESTRAL',
            6: 'PLANO COMPLETO - SEMESTRAL',
            12: 'PLANO COMPLETO - ANUAL'
        },
        servidor3: {
            1: '1 MÊS COMPLETO C/ ADULTO',
            3: '3 MÊS C/ ADULTO',
            6: '6 MÊS C/ ADULTO',
            12: 'ANUAL COMPLETO'
        }
    };
    
    return planos[servidor]?.[meses] || planos[servidor]?.[1];
}

// Função para renovar no Servidor 1 (TropicalPlayTV)
async function renovarServidor1(clienteId, meses, browser) {
    const servidor = 'servidor1';
    const config = SERVIDORES[servidor];
    
    try {
        log(servidor, 'Iniciando renovação...');
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Navegar para o painel
        log(servidor, 'Navegando para o painel...');
        await page.goto(config.url, { waitUntil: 'networkidle0', timeout: 30000 });
        await sleep(2000);
        
        // Fazer login
        log(servidor, 'Fazendo login...');
        const userField = await page.$('#username');
        const passField = await page.$('#password');
        
        if (userField && passField) {
            // Colar dados diretamente para ser mais rápido
            await page.evaluate((element, value) => {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, userField, config.usuario);
            
            await page.evaluate((element, value) => {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, passField, config.senha);
            
            const loginBtn = await page.$('#button-login');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(3000);
                log(servidor, 'Login realizado!', 'success');
            }
        }
        
        // Navegar para clientes
        log(servidor, 'Navegando para página de clientes...');
        await page.goto(`${config.url}/iptv/clients`, { waitUntil: 'networkidle0', timeout: 30000 });
        await sleep(3000);
        
        // Buscar cliente
        log(servidor, `Buscando cliente ${clienteId}...`);
        const searchField = await page.$('input[type="search"]');
        if (searchField) {
            // Colar ID do cliente diretamente
            await page.evaluate((element, value) => {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, searchField, clienteId);
            
            await page.keyboard.press('Enter');
            await sleep(3000);
        }
        
        // Procurar botão de renovação na linha do cliente
        log(servidor, 'Procurando botão de renovação...');
        
        // Primeiro, procurar a linha que contém o cliente
        const clientRow = await page.evaluateHandle((clientId) => {
            const rows = document.querySelectorAll('tr');
            for (const row of rows) {
                if (row.textContent.includes(clientId)) {
                    return row;
                }
            }
            return null;
        }, clienteId);
        
        if (clientRow) {
            log(servidor, 'Linha do cliente encontrada');
            
            // Procurar botão de renovação específico do Servidor 1
            const renewIcon = await clientRow.$('i.fad.fa-calendar-alt');
            
            if (renewIcon) {
                log(servidor, 'Ícone de renovação encontrado');
                // Clicar no botão pai do ícone
                await page.evaluate((icon) => {
                    const button = icon.closest('button') || icon.closest('a') || icon.parentElement;
                    if (button) {
                        button.click();
                    } else {
                        icon.click();
                    }
                }, renewIcon);
                await sleep(2000);
                
                // Se houver campo para selecionar meses
                const monthsField = await page.$('select[name="months"], input[name="months"], select[id*="month"]');
                if (monthsField) {
                    log(servidor, `Selecionando ${meses} mês(es)...`);
                    try {
                        await monthsField.selectOption(String(meses));
                    } catch (e) {
                        // Se selectOption falhar, tentar com evaluate
                        await page.evaluate((element, value) => {
                            element.value = value;
                            element.dispatchEvent(new Event('change', { bubbles: true }));
                        }, monthsField, String(meses));
                    }
                    await sleep(1000);
                }
                
                // Confirmar renovação se houver modal
                const confirmSelectors = [
                    'button[type="submit"]',
                    'button[class*="confirm"]',
                    'button[class*="renew"]',
                    '.btn-primary',
                    '.btn-success'
                ];
                
                let confirmBtn = null;
                for (const selector of confirmSelectors) {
                    confirmBtn = await page.$(selector);
                    if (confirmBtn) {
                        const btnText = await page.evaluate(el => el.textContent, confirmBtn);
                        if (btnText.toLowerCase().includes('confirm') || 
                            btnText.toLowerCase().includes('renew') || 
                            btnText.toLowerCase().includes('ok') ||
                            btnText.toLowerCase().includes('renovar')) {
                            break;
                        }
                        confirmBtn = null;
                    }
                }
                
                if (confirmBtn) {
                    log(servidor, 'Confirmando renovação...');
                    await confirmBtn.click();
                    await sleep(3000);
                }
                
                log(servidor, `Renovação de ${meses} mês(es) realizada com sucesso!`, 'success');
                await page.close();
                return { sucesso: true, servidor: config.nome, meses };
            } else {
                log(servidor, 'Botão de renovação não encontrado na linha do cliente', 'warning');
                await page.close();
                return { sucesso: false, servidor: config.nome, erro: 'Botão não encontrado na linha' };
            }
        } else {
            log(servidor, 'Cliente não encontrado na tabela', 'warning');
            await page.close();
            return { sucesso: false, servidor: config.nome, erro: 'Cliente não encontrado' };
        }
        
    } catch (error) {
        log(servidor, `Erro: ${error.message}`, 'error');
        return { sucesso: false, servidor: config.nome, erro: error.message };
    }
}

// Função para renovar no Servidor 2 (SpiderTV)
async function renovarServidor2(clienteId, meses, browser) {
    const servidor = 'servidor2';
    const config = SERVIDORES[servidor];
    
    try {
        log(servidor, 'Iniciando renovação...');
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Navegar para login
        log(servidor, 'Navegando para página de login...');
        await page.goto(`${config.url}/#/sign-in`, { waitUntil: 'networkidle0', timeout: 30000 });
        await sleep(3000);
        
        // Fazer login
        log(servidor, 'Fazendo login...');
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            await page.evaluate((element, value) => {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, userField, config.usuario);
            
            await page.evaluate((element, value) => {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, passField, config.senha);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(4000);
                log(servidor, 'Login realizado!', 'success');
            }
        }
        
        // Navegar para clientes
        log(servidor, 'Navegando para página de clientes...');
        await page.goto(`${config.url}/#/customers`, { waitUntil: 'networkidle0', timeout: 30000 });
        await sleep(3000);
        
        // Buscar cliente
        log(servidor, `Buscando cliente ${clienteId}...`);
        const searchField = await page.$('input[placeholder="Pesquisar"]');
        if (searchField) {
            await page.evaluate((element, value) => {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, searchField, clienteId);
            
            await searchField.press('Enter');
            await sleep(4000);
        }
        
        // Procurar botão de renovação
        log(servidor, 'Procurando botão de renovação...');
        const renewBtn = await page.$('button.btn-warning i.fa-calendar-plus');
        
        if (renewBtn) {
            const parentButton = await page.evaluateHandle(el => el.parentElement, renewBtn);
            await parentButton.click();
            await sleep(3000);
            
            // Aguardar modal e selecionar plano
            await page.waitForSelector('#renewModal', { timeout: 10000 });
            log(servidor, 'Modal de renovação aberto');
            
            // Selecionar o plano correto baseado nos meses
            const planoCorreto = obterPlano('servidor2', meses);
            log(servidor, `Selecionando plano: ${planoCorreto}`);
            
            // Procurar dropdown de planos usando o seletor correto
            const planSelect = await page.$('#renewModal .el-select__selected-item, #renewModal .el-select');
            if (planSelect) {
                await planSelect.click();
                await sleep(2000); // Aguardar dropdown abrir
                
                // Aguardar dropdown aparecer completamente
                await page.waitForSelector('.el-select-dropdown__item', { timeout: 10000 });
                await sleep(1000); // Aguardar estabilizar
                
                // Procurar e clicar na opção do plano usando busca por texto específico
                const planSelected = await page.evaluate((meses) => {
                    const textosProcurar = {
                        1: 'PLANO COMPLETO',
                        3: 'PLANO COMPLETO - TRIMESTRAL', 
                        6: 'PLANO COMPLETO - SEMESTRAL',
                        12: 'PLANO COMPLETO - ANUAL'
                    };
                    
                    const textoProcurar = textosProcurar[meses] || 'PLANO COMPLETO';
                    console.log(`Procurando por: "${textoProcurar}"`);
                    
                    // Primeiro, listar todos os itens disponíveis para debug
                    const allItems = document.querySelectorAll('.el-select-dropdown__item');
                    console.log('Itens disponíveis no dropdown:');
                    allItems.forEach((item, index) => {
                        console.log(`${index}: "${item.textContent.trim()}"`);
                    });
                    
                    // Procurar pelo texto exato
                    for (let i = 0; i < allItems.length; i++) {
                        const item = allItems[i];
                        const itemText = item.textContent.trim();
                        
                        if (itemText === textoProcurar) {
                            console.log(`Encontrou item na posição ${i}: "${itemText}"`);
                            item.click();
                            return { success: true, found: itemText, position: i };
                        }
                    }
                    
                    // Se não encontrou por texto exato, tentar por posição como fallback
                    console.log('Não encontrou por texto, tentando por posição...');
                    const posicaoPlanos = {
                        1: 1,   // PLANO COMPLETO - segunda opção (índice 1)
                        3: 4,   // PLANO COMPLETO - TRIMESTRAL - quinta opção (índice 4)
                        6: 5,   // PLANO COMPLETO - SEMESTRAL - sexta opção (índice 5)
                        12: 6   // PLANO COMPLETO - ANUAL - sétima opção (índice 6)
                    };
                    
                    const posicao = posicaoPlanos[meses] || 1;
                    
                    if (allItems[posicao]) {
                        console.log(`Clicando na posição ${posicao}: "${allItems[posicao].textContent.trim()}"`);
                        allItems[posicao].click();
                        return { success: true, found: allItems[posicao].textContent.trim(), position: posicao };
                    }
                    
                    return { success: false, error: 'Nenhum item encontrado' };
                }, meses);
                
                console.log('Resultado da seleção:', planSelected);
                
                await sleep(2000); // Aguardar seleção
                log(servidor, `Tentativa de seleção do plano: ${planoCorreto}`);
            }
            
            // Confirmar renovação
            const modalRenovarBtn = await page.$('#renewModal button[type="submit"]');
            if (modalRenovarBtn) {
                await modalRenovarBtn.click();
                await sleep(5000);
                log(servidor, `Renovação de ${meses} mês(es) com plano ${planoCorreto} realizada com sucesso!`, 'success');
            }
            
            await page.close();
            return { sucesso: true, servidor: config.nome, meses, plano: planoCorreto };
        } else {
            log(servidor, 'Botão de renovação não encontrado', 'warning');
            await page.close();
            return { sucesso: false, servidor: config.nome, erro: 'Botão não encontrado' };
        }
        
    } catch (error) {
        log(servidor, `Erro: ${error.message}`, 'error');
        return { sucesso: false, servidor: config.nome, erro: error.message };
    }
}

// Função para renovar no Servidor 3 (Premium Server)
async function renovarServidor3(clienteId, meses, browser) {
    const servidor = 'servidor3';
    const config = SERVIDORES[servidor];
    
    try {
        log(servidor, 'Iniciando renovação...');
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Navegar para login
        log(servidor, 'Navegando para página de login...');
        await page.goto(`${config.url}/#/sign-in`, { waitUntil: 'networkidle0', timeout: 30000 });
        await sleep(3000);
        
        // Fazer login
        log(servidor, 'Fazendo login...');
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            await page.evaluate((element, value) => {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, userField, config.usuario);
            
            await page.evaluate((element, value) => {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, passField, config.senha);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(4000);
                log(servidor, 'Login realizado!', 'success');
            }
        }
        
        // Navegar para clientes
        log(servidor, 'Navegando para página de clientes...');
        await page.goto(`${config.url}/#/customers`, { waitUntil: 'networkidle0', timeout: 30000 });
        await sleep(5000);
        
        // Buscar cliente
        log(servidor, `Buscando cliente ${clienteId}...`);
        const searchField = await page.$('input[placeholder="Pesquisar"]');
        if (searchField) {
            await page.evaluate((element, value) => {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, searchField, clienteId);
            
            await searchField.press('Enter');
            await sleep(4000);
        }
        
        // Procurar ícone de renovação específico
        log(servidor, 'Procurando ícone de renovação...');
        const renewIcon = await page.$('i.fad.fa-calendar-plus.text-white');
        
        if (renewIcon) {
            await page.evaluate((icon) => {
                const button = icon.closest('button');
                if (button) {
                    button.click();
                } else {
                    icon.parentElement.click();
                }
            }, renewIcon);
            
            await sleep(3000);
            
            // Procurar modal e selecionar plano
            const modalSelectors = ['#renewModal', '.modal.show', '.modal[style*="display: block"]'];
            let modalFound = false;
            
            for (const modalSelector of modalSelectors) {
                const modal = await page.$(modalSelector);
                if (modal) {
                    log(servidor, 'Modal de renovação aberto');
                    
                    // Selecionar o plano correto baseado nos meses
                    const planoCorreto = obterPlano('servidor3', meses);
                    log(servidor, `Selecionando plano: ${planoCorreto}`);
                    
                    // Procurar dropdown de planos usando o seletor correto
                    const planSelect = await page.$(`${modalSelector} .el-select__selected-item, ${modalSelector} .el-select`);
                    if (planSelect) {
                        await planSelect.click();
                        await sleep(2000); // Aguardar dropdown abrir
                        
                        // Procurar e clicar na opção do plano usando posição no dropdown
                        const planSelected = await page.evaluate((meses) => {
                            // Mapeamento de meses para posição no dropdown do Servidor 3 (baseado em zero, conforme screenshot)
                            const posicaoPlanos = {
                                1: 0,   // 1 MÊS COMPLETO C/ ADULTO - primeira opção (índice 0)
                                3: 2,   // 3 MÊS C/ ADULTO - terceira opção (índice 2)
                                6: 4,   // 6 MÊS C/ ADULTO - quinta opção (índice 4)
                                12: 6   // ANUAL COMPLETO - sétima opção (índice 6)
                            };
                            
                            const posicao = posicaoPlanos[meses] || 0; // Default para 1 mês
                            
                            setTimeout(() => {
                                const items = document.querySelectorAll('.el-select-dropdown__item, .el-popper .el-select-dropdown__item');
                                if (items && items[posicao]) {
                                    items[posicao].click();
                                    return true;
                                }
                                
                                // Fallback: tentar por texto
                                const spans = document.querySelectorAll('.el-select-dropdown span, .el-select-dropdown__item span, .el-popper span');
                                const textosProcurar = {
                                    1: '1 MÊS COMPLETO C/ ADULTO',
                                    3: '3 MÊS C/ ADULTO',
                                    6: '6 MÊS C/ ADULTO',
                                    12: 'ANUAL COMPLETO'
                                };
                                
                                const textoProcurar = textosProcurar[meses] || '1 MÊS COMPLETO C/ ADULTO';
                                
                                for (const span of spans) {
                                    if (span.textContent.trim() === textoProcurar) {
                                        const clickableElement = span.closest('.el-select-dropdown__item') || span.closest('li') || span.parentElement;
                                        if (clickableElement) {
                                            clickableElement.click();
                                            return true;
                                        }
                                    }
                                }
                                return false;
                            }, 500);
                            return true;
                        }, meses);
                        
                        await sleep(2000); // Aguardar seleção
                        log(servidor, `Tentativa de seleção do plano: ${planoCorreto}`);
                    }
                    
                    // Confirmar renovação
                    const renewButton = await page.$(`${modalSelector} button[type="submit"]`);
                    if (renewButton) {
                        await renewButton.click();
                        await sleep(5000);
                        modalFound = true;
                        log(servidor, `Renovação de ${meses} mês(es) com plano ${planoCorreto} realizada com sucesso!`, 'success');
                        break;
                    }
                }
            }
            
            if (!modalFound) {
                log(servidor, 'Modal de confirmação não encontrado', 'warning');
            }
            
            await page.close();
            return { sucesso: modalFound, servidor: config.nome, meses, plano: obterPlano('servidor3', meses) };
        } else {
            log(servidor, 'Ícone de renovação não encontrado', 'warning');
            await page.close();
            return { sucesso: false, servidor: config.nome, erro: 'Ícone não encontrado' };
        }
        
    } catch (error) {
        log(servidor, `Erro: ${error.message}`, 'error');
        return { sucesso: false, servidor: config.nome, erro: error.message };
    }
}

// Função principal
async function renovarTodosServidores(clienteId = '648718886', meses = 1) {
    console.log('🚀 INICIANDO RENOVAÇÃO NOS 3 SERVIDORES');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: ${meses} mês(es)`);
    console.log('=' .repeat(60));
    
    let browser;
    const resultados = [];
    
    try {
        // Lançar navegador
        console.log('🌐 Lançando navegador...');
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
        
        console.log('✅ Navegador lançado!\n');
        
        // Renovar Servidor 1
        console.log('🌴 === SERVIDOR 1: TROPICALPLAYTV ===');
        const resultado1 = await renovarServidor1(clienteId, meses, browser);
        resultados.push(resultado1);
        console.log('');
        
        // Renovar Servidor 2
        console.log('🕷️ === SERVIDOR 2: SPIDERTV ===');
        const resultado2 = await renovarServidor2(clienteId, meses, browser);
        resultados.push(resultado2);
        console.log('');
        
        // Renovar Servidor 3
        console.log('⭐ === SERVIDOR 3: PREMIUM SERVER ===');
        const resultado3 = await renovarServidor3(clienteId, meses, browser);
        resultados.push(resultado3);
        console.log('');
        
        // Relatório final
        console.log('📊 === RELATÓRIO FINAL ===');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: ${meses} mês(es)`);
        console.log('=' .repeat(40));
        
        let sucessos = 0;
        let falhas = 0;
        
        resultados.forEach((resultado, index) => {
            const numero = index + 1;
            if (resultado.sucesso) {
                const planoInfo = resultado.plano ? ` (${resultado.plano})` : '';
                console.log(`✅ Servidor ${numero} (${resultado.servidor}): SUCESSO${planoInfo}`);
                sucessos++;
            } else {
                console.log(`❌ Servidor ${numero} (${resultado.servidor}): FALHA - ${resultado.erro || 'Erro desconhecido'}`);
                falhas++;
            }
        });
        
        console.log('=' .repeat(40));
        console.log(`📈 Sucessos: ${sucessos}/3`);
        console.log(`📉 Falhas: ${falhas}/3`);
        
        if (sucessos === 3) {
            console.log('🎉 TODAS AS RENOVAÇÕES FORAM REALIZADAS COM SUCESSO!');
        } else if (sucessos > 0) {
            console.log('⚠️ ALGUMAS RENOVAÇÕES FORAM REALIZADAS COM SUCESSO');
        } else {
            console.log('💥 TODAS AS RENOVAÇÕES FALHARAM');
        }
        
        // Aguardar para visualização
        console.log('\n👀 Mantendo navegador aberto por 10 segundos...');
        await sleep(10000);
        
    } catch (error) {
        console.error('💥 Erro geral:', error.message);
    } finally {
        if (browser) {
            console.log('🔄 Fechando navegador...');
            await browser.close();
            console.log('✅ Navegador fechado');
        }
    }
    
    console.log('\n🏁 PROCESSO FINALIZADO!');
}

// Executar script
const clienteId = process.argv[2] || '648718886';
const meses = parseInt(process.argv[3]) || 1;

// Validar meses
const mesesValidos = [1, 3, 6, 12];
if (!mesesValidos.includes(meses)) {
    console.error('❌ Período inválido! Use: 1, 3, 6 ou 12 meses');
    console.log('💡 Exemplo: node renovar-3-servidores.cjs 648718886 3');
    process.exit(1);
}

console.log(`🎯 Cliente a ser renovado: ${clienteId}`);
console.log(`📅 Período: ${meses} mês(es)`);

// Mostrar planos que serão selecionados
console.log('\n📋 Planos que serão selecionados:');
console.log(`🕷️ Servidor 2: ${obterPlano('servidor2', meses)}`);
console.log(`⭐ Servidor 3: ${obterPlano('servidor3', meses)}`);
console.log('');

renovarTodosServidores(clienteId, meses).catch(console.error);
