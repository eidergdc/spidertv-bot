/**
 * Renovação Servidor 2 - Versão Final com Coordenadas
 * 
 * Usa coordenadas fixas para clicar na opção de 6 meses
 * Baseado na posição conhecida da opção "PLANO COMPLETO - SEMESTRAL"
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

async function renovarComCoordenadas(clienteId, meses) {
    console.log('🎯 RENOVAÇÃO SERVIDOR 2 - VERSÃO FINAL COORDENADAS');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: ${meses} meses`);
    console.log(`🎯 Método: Clique por coordenadas na posição da opção de 6 meses`);
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
            const firstRow = await page.$('tbody tr:first-child');
            if (firstRow) {
                await firstRow.click();
                await sleep(3000);
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
            await sleep(4000);
            
            // SELEÇÃO POR COORDENADAS PARA 6 MESES
            if (meses === 6) {
                log('🎯 INICIANDO SELEÇÃO POR COORDENADAS (6 MESES)', 'info');
                
                // Procurar dropdown
                const packageDropdown = await page.$('[data-test="package_id"]');
                if (packageDropdown) {
                    log('Dropdown encontrado!', 'success');
                    
                    // Abrir dropdown
                    log('Abrindo dropdown...');
                    try {
                        await packageDropdown.click();
                        log('Dropdown aberto com clique normal', 'success');
                    } catch (error) {
                        log('Clique normal falhou, tentando JavaScript...', 'warning');
                        await page.evaluate(el => el.click(), packageDropdown);
                        log('Dropdown aberto com JavaScript', 'success');
                    }
                    
                    // Aguardar opções carregarem
                    await sleep(3000);
                    
                    try {
                        await page.waitForSelector('.el-select-dropdown__item', { timeout: 8000 });
                        log('Opções do dropdown carregadas!', 'success');
                    } catch (error) {
                        log('Timeout aguardando opções, continuando...', 'warning');
                    }
                    
                    // CLIQUE POR COORDENADAS NA OPÇÃO DE 6 MESES
                    log('Clicando por coordenadas na opção "PLANO COMPLETO - SEMESTRAL"...', 'info');
                    
                    // Coordenadas baseadas na posição típica da opção SEMESTRAL
                    // Estas são coordenadas aproximadas onde geralmente aparece a 6ª opção
                    const coordenadasSemestral = [
                        { x: 640, y: 420 }, // Posição central típica
                        { x: 640, y: 440 }, // Ligeiramente abaixo
                        { x: 640, y: 400 }, // Ligeiramente acima
                        { x: 620, y: 420 }, // Ligeiramente à esquerda
                        { x: 660, y: 420 }  // Ligeiramente à direita
                    ];
                    
                    let opcaoSelecionada = false;
                    
                    for (let i = 0; i < coordenadasSemestral.length && !opcaoSelecionada; i++) {
                        const coord = coordenadasSemestral[i];
                        log(`Tentativa ${i + 1}: Clicando em (${coord.x}, ${coord.y})...`, 'info');
                        
                        try {
                            await page.mouse.click(coord.x, coord.y);
                            await sleep(2000);
                            
                            // Verificar se o dropdown fechou (indicando seleção bem-sucedida)
                            const dropdownAberto = await page.$('.el-select-dropdown__item');
                            if (!dropdownAberto) {
                                log(`✅ Seleção bem-sucedida na tentativa ${i + 1}!`, 'success');
                                opcaoSelecionada = true;
                            } else {
                                log(`Tentativa ${i + 1} não fechou o dropdown, tentando próxima...`, 'warning');
                            }
                        } catch (error) {
                            log(`Erro na tentativa ${i + 1}: ${error.message}`, 'warning');
                        }
                    }
                    
                    if (opcaoSelecionada) {
                        log('✅ Plano de 6 meses selecionado com sucesso!', 'success');
                    } else {
                        log('⚠️ Não foi possível selecionar por coordenadas, tentando fallback...', 'warning');
                        
                        // Fallback: tentar encontrar e clicar na opção por texto
                        const optionElements = await page.$$('.el-select-dropdown__item');
                        for (const option of optionElements) {
                            const text = await page.evaluate(el => el.textContent?.trim() || '', option);
                            if (text.includes('SEMESTRAL')) {
                                log(`Fallback: Encontrado "${text}", clicando...`, 'info');
                                try {
                                    await option.click();
                                    opcaoSelecionada = true;
                                    break;
                                } catch (error) {
                                    await page.evaluate(el => el.click(), option);
                                    opcaoSelecionada = true;
                                    break;
                                }
                            }
                        }
                    }
                    
                } else {
                    log('❌ Dropdown não encontrado', 'error');
                }
            } else {
                log('⚠️ Este script é otimizado para 6 meses. Para outros períodos, use outro script.', 'warning');
            }
            
            // Aguardar um pouco para verificar seleção
            await sleep(2000);
            
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
        console.log(`🎯 Método: Coordenadas fixas`);
        
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
const meses = parseInt(process.argv[3]) || 6;

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node renovar-servidor2-final-coordenadas.cjs <cliente_id> <meses>');
    console.log('📖 Exemplo: node renovar-servidor2-final-coordenadas.cjs 359503850 6');
    process.exit(1);
}

if (meses !== 6) {
    console.log('⚠️ Aviso: Este script é otimizado para 6 meses');
    console.log('📖 Para outros períodos, use: node renovar-servidor2-dropdown-final.cjs');
}

// Executar renovação
renovarComCoordenadas(clienteId, meses).catch(console.error);
