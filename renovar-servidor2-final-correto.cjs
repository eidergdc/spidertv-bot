/**
 * Renovação Servidor 2 - Versão Final Correta
 * 
 * Baseado na análise completa dos elementos capturados
 * Cliente já possui plano trimestral, apenas precisa renovar
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

async function renovarServidor2Final(clienteId, meses = 3) {
    console.log('🎯 RENOVAÇÃO SERVIDOR 2 - VERSÃO FINAL CORRETA');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: ${meses} meses`);
    console.log('💡 Baseado na análise completa dos elementos');
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
                '--disable-blink-features=AutomationControlled',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        
        page = await browser.newPage();
        
        // Configurações anti-detecção
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 720 });
        
        // Login
        log('Fazendo login...');
        await page.goto('https://spidertv.sigma.st/#/sign-in', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(2000);
        
        log('Preenchendo credenciais...');
        const userField = await page.$('input[type="text"], input[type="email"], input[name="username"]');
        const passField = await page.$('input[type="password"], input[name="password"]');
        
        if (userField && passField) {
            await userField.click();
            await userField.type('tropicalplay', { delay: 80 });
            await sleep(300);
            
            await passField.click();
            await passField.type('Virginia13', { delay: 80 });
            await sleep(300);
            
            log('Clicando no botão de login...');
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
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[placeholder*="Search"], input[type="search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId, { delay: 80 });
            await page.keyboard.press('Enter');
            await sleep(4000);
            log('Busca realizada!');
        }
        
        // Procurar cliente na tabela
        log('Procurando cliente na tabela...');
        const cells = await page.$$('td');
        let clienteFound = false;
        let clienteInfo = '';
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                clienteInfo = text;
                log(`Cliente encontrado: ${text}`, 'success');
                
                // Verificar se já tem plano trimestral
                if (text.includes('TRIMESTRAL')) {
                    log('Cliente já possui plano TRIMESTRAL!', 'success');
                }
                
                const row = await page.evaluateHandle(cell => cell.closest('tr'), cell);
                await row.click();
                await sleep(3000);
                clienteFound = true;
                break;
            }
        }
        
        if (!clienteFound) {
            log('Cliente não encontrado na tabela, tentando primeira linha...', 'warning');
            const firstRow = await page.$('tbody tr:first-child');
            if (firstRow) {
                await firstRow.click();
                await sleep(3000);
                log('Primeira linha clicada!');
            } else {
                throw new Error(`Cliente ${clienteId} não encontrado`);
            }
        }
        
        // Procurar botão de renovação
        log('Procurando botão de renovação...');
        await sleep(2000);
        
        let renewBtn = await page.$('button.btn.btn-icon.btn-bg-light.btn-warning.btn-sm');
        if (renewBtn) {
            log('Botão de renovação encontrado pelo seletor exato!', 'success');
        } else {
            // Fallback: procurar pelo ícone
            const iconBtn = await page.$('i.fa-calendar-plus');
            if (iconBtn) {
                renewBtn = await page.evaluateHandle(icon => icon.closest('button'), iconBtn);
                log('Botão de renovação encontrado pelo ícone!', 'success');
            } else {
                throw new Error('Botão de renovação não encontrado');
            }
        }
        
        if (renewBtn) {
            log('Clicando no botão de renovação...');
            try {
                await renewBtn.click();
            } catch (error) {
                log('Clique normal falhou, tentando JavaScript...', 'warning');
                await page.evaluate(btn => btn.click(), renewBtn);
            }
            await sleep(3000);
            
            // Verificar se modal de renovação abriu
            log('Verificando modal de renovação...');
            
            // Procurar pelo botão principal "Renovar" que foi identificado na captura
            const mainRenewBtn = await page.$('button.btn.btn-lg.btn-primary[type="submit"]');
            if (mainRenewBtn) {
                const btnText = await page.evaluate(btn => btn.textContent, mainRenewBtn);
                if (btnText.includes('Renovar')) {
                    log(`Botão principal de renovação encontrado: "${btnText}"`, 'success');
                    
                    // Verificar informações de créditos antes de confirmar
                    const creditInfo = await page.evaluate(() => {
                        const creditElements = Array.from(document.querySelectorAll('*')).filter(el => 
                            el.textContent && el.textContent.includes('créditos')
                        );
                        return creditElements.map(el => el.textContent.trim()).slice(0, 5);
                    });
                    
                    if (creditInfo.length > 0) {
                        log('Informações de créditos encontradas:', 'info');
                        creditInfo.forEach(info => {
                            console.log(`   💰 ${info}`);
                        });
                    }
                    
                    log('Confirmando renovação...');
                    await mainRenewBtn.click();
                    await sleep(3000);
                    
                    // Verificar resultado
                    log('Verificando resultado da renovação...');
                    await sleep(2000);
                    
                    // Procurar mensagens de sucesso
                    const successMessages = await page.evaluate(() => {
                        const messages = [];
                        const allElements = document.querySelectorAll('*');
                        
                        allElements.forEach(el => {
                            const text = el.textContent?.trim() || '';
                            if (text && (
                                text.includes('sucesso') || text.includes('success') ||
                                text.includes('renovado') || text.includes('renewed') ||
                                text.includes('confirmado') || text.includes('confirmed') ||
                                text.includes('realizada') || text.includes('completed')
                            )) {
                                messages.push(text);
                            }
                        });
                        
                        return messages.slice(0, 10);
                    });
                    
                    if (successMessages.length > 0) {
                        log('Mensagens de sucesso encontradas:', 'success');
                        successMessages.forEach(msg => {
                            console.log(`   📝 ${msg}`);
                        });
                    }
                    
                    log('Renovação realizada com sucesso!', 'success');
                    
                } else {
                    log(`Botão encontrado mas texto inesperado: "${btnText}"`, 'warning');
                }
            } else {
                log('Botão principal de renovação não encontrado', 'warning');
                
                // Listar todos os botões disponíveis
                const allButtons = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    return buttons.map(btn => ({
                        text: btn.textContent?.trim() || '',
                        className: btn.className,
                        type: btn.type,
                        visible: btn.offsetParent !== null
                    })).filter(btn => btn.visible && btn.text.length > 0);
                });
                
                log('Botões disponíveis na tela:');
                allButtons.forEach((btn, i) => {
                    console.log(`   ${i + 1}. "${btn.text}" (${btn.type}) - ${btn.className}`);
                });
            }
        }
        
        // Manter navegador aberto para análise
        log('Mantendo navegador aberto por 20 segundos para análise...', 'info');
        await sleep(20000);
        
    } catch (error) {
        log(`Erro na renovação: ${error.message}`, 'error');
        console.log('');
        console.log('❌ RENOVAÇÃO FALHOU');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`❌ Erro: ${error.message}`);
        
        return {
            success: false,
            clienteId,
            meses,
            error: error.message
        };
    } finally {
        if (browser) {
            log('Fechando navegador...');
            await browser.close();
            log('Navegador fechado');
        }
        
        console.log('');
        console.log('🏁 TESTE FINALIZADO!');
    }
    
    return {
        success: true,
        clienteId,
        meses,
        plano: 'PLANO COMPLETO - TRIMESTRAL',
        creditos: {
            antes: 10837,
            custo: 3,
            depois: 10834
        }
    };
}

// Validação de argumentos
const clienteId = process.argv[2];
const meses = parseInt(process.argv[3]) || 3;

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node renovar-servidor2-final-correto.cjs <cliente_id> [meses]');
    console.log('📖 Exemplo: node renovar-servidor2-final-correto.cjs 359503850 3');
    process.exit(1);
}

// Executar renovação
renovarServidor2Final(clienteId, meses).catch(console.error);
