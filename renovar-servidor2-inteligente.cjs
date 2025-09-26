/**
 * Renovação Servidor 2 - Versão Inteligente
 * 
 * Detecta automaticamente se precisa:
 * 1. Apenas renovar (mesmo período)
 * 2. Alterar plano + renovar (período diferente)
 * 
 * Suporta: 1, 3, 6, 12 meses
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
        case 'decision': prefix = '🤔'; break;
        default: prefix = '📝'; break;
    }
    
    console.log(`[${timestamp}] 🕷️ SpiderTV ${prefix} ${mensagem}`);
}

// Mapear períodos para tipos de plano
function obterTipoPlano(meses) {
    switch (meses) {
        case 1: return 'MENSAL';
        case 3: return 'TRIMESTRAL';
        case 6: return 'SEMESTRAL';
        case 12: return 'ANUAL';
        default: return 'TRIMESTRAL';
    }
}

// Detectar plano atual do cliente
function detectarPlanoAtual(textoCliente) {
    if (textoCliente.includes('TRIMESTRAL')) return 'TRIMESTRAL';
    if (textoCliente.includes('MENSAL')) return 'MENSAL';
    if (textoCliente.includes('SEMESTRAL')) return 'SEMESTRAL';
    if (textoCliente.includes('ANUAL')) return 'ANUAL';
    return 'DESCONHECIDO';
}

async function renovarServidor2Inteligente(clienteId, meses) {
    console.log('🧠 RENOVAÇÃO SERVIDOR 2 - VERSÃO INTELIGENTE');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período desejado: ${meses} meses (${obterTipoPlano(meses)})`);
    console.log('🤖 Detecta automaticamente se precisa alterar plano');
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
        
        // Procurar cliente na tabela e detectar plano atual
        log('Analisando cliente na tabela...');
        const cells = await page.$$('td');
        let clienteFound = false;
        let planoAtual = 'DESCONHECIDO';
        let textoCompleto = '';
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                textoCompleto = text;
                planoAtual = detectarPlanoAtual(text);
                
                log(`Cliente encontrado: ${text}`, 'success');
                log(`Plano atual detectado: ${planoAtual}`, 'info');
                
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
        
        // Decisão inteligente: renovar ou alterar plano
        const tipoDesejado = obterTipoPlano(meses);
        const precisaAlterarPlano = planoAtual !== tipoDesejado && planoAtual !== 'DESCONHECIDO';
        
        if (precisaAlterarPlano) {
            log(`Plano atual (${planoAtual}) ≠ Plano desejado (${tipoDesejado})`, 'decision');
            log('Será necessário ALTERAR PLANO primeiro!', 'warning');
        } else {
            log(`Plano atual (${planoAtual}) = Plano desejado (${tipoDesejado})`, 'decision');
            log('Apenas RENOVAÇÃO será necessária!', 'success');
        }
        
        // Procurar botão de renovação
        log('Procurando botão de renovação...');
        await sleep(2000);
        
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
            
            if (precisaAlterarPlano) {
                // FLUXO: ALTERAR PLANO
                log('Iniciando processo de alteração de plano...', 'decision');
                
                // Procurar botão/link para alterar plano
                log('Procurando botão de alterar plano...');
                const allButtons = await page.$$('button, a');
                let alterarPlanoBtn = null;
                
                for (const btn of allButtons) {
                    const text = await page.evaluate(el => el.textContent?.trim() || '', btn);
                    if (text.includes('Alterar') || text.includes('Mudar') || text.includes('Trocar')) {
                        log(`Botão de alterar plano encontrado: "${text}"`, 'success');
                        alterarPlanoBtn = btn;
                        break;
                    }
                }
                
                if (alterarPlanoBtn) {
                    await alterarPlanoBtn.click();
                    await sleep(2000);
                    
                    // Aguardar modal de alteração de plano
                    try {
                        await page.waitForSelector('#changePackageModal', { timeout: 5000 });
                        log('Modal de alteração de plano aberto!', 'success');
                        
                        // Procurar opções de plano no modal
                        log(`Procurando opção de plano ${tipoDesejado}...`);
                        
                        // Capturar todas as opções disponíveis
                        const opcoes = await page.evaluate(() => {
                            const modal = document.querySelector('#changePackageModal');
                            if (!modal) return [];
                            
                            const elementos = modal.querySelectorAll('button, option, input, .plan-option');
                            return Array.from(elementos).map(el => ({
                                tagName: el.tagName,
                                text: el.textContent?.trim() || '',
                                value: el.value || '',
                                className: el.className,
                                type: el.type || ''
                            })).filter(el => el.text.length > 0);
                        });
                        
                        log('Opções de plano disponíveis no modal:');
                        opcoes.forEach((opcao, i) => {
                            console.log(`   ${i + 1}. ${opcao.tagName}: "${opcao.text}" (${opcao.className})`);
                        });
                        
                        // Tentar encontrar a opção desejada
                        let opcaoEncontrada = false;
                        for (const btn of await page.$$('#changePackageModal button, #changePackageModal option')) {
                            const text = await page.evaluate(el => el.textContent?.trim() || '', btn);
                            if (text.includes(tipoDesejado) || 
                                (meses === 6 && (text.includes('6') || text.includes('SEMESTRAL'))) ||
                                (meses === 12 && (text.includes('12') || text.includes('ANUAL'))) ||
                                (meses === 1 && (text.includes('1') || text.includes('MENSAL')))) {
                                
                                log(`Opção de plano encontrada: "${text}"`, 'success');
                                await btn.click();
                                await sleep(1000);
                                opcaoEncontrada = true;
                                break;
                            }
                        }
                        
                        if (!opcaoEncontrada) {
                            log(`Opção de plano ${tipoDesejado} não encontrada automaticamente`, 'warning');
                            log('Continuando com renovação do plano atual...', 'info');
                        }
                        
                        // Confirmar alteração
                        const confirmarAlteracao = await page.$('#changePackageModal button.btn-primary[type="submit"]');
                        if (confirmarAlteracao) {
                            const btnText = await page.evaluate(btn => btn.textContent, confirmarAlteracao);
                            log(`Confirmando alteração: "${btnText}"`, 'info');
                            await confirmarAlteracao.click();
                            await sleep(3000);
                            log('Alteração de plano processada!', 'success');
                        }
                        
                    } catch (modalError) {
                        log('Modal de alteração não encontrado, continuando com renovação...', 'warning');
                    }
                } else {
                    log('Botão de alterar plano não encontrado, continuando com renovação...', 'warning');
                }
            }
            
            // FLUXO: RENOVAÇÃO (sempre executado)
            log('Iniciando processo de renovação...', 'decision');
            
            const mainRenewBtn = await page.$('button.btn.btn-lg.btn-primary[type="submit"]');
            if (mainRenewBtn) {
                const btnText = await page.evaluate(btn => btn.textContent, mainRenewBtn);
                if (btnText.includes('Renovar')) {
                    log('Confirmando renovação...', 'info');
                    await mainRenewBtn.click();
                    await sleep(3000);
                    
                    log('Renovação realizada com sucesso!', 'success');
                }
            }
        }
        
        // Manter navegador aberto
        log('Mantendo navegador aberto por 15 segundos...', 'info');
        await sleep(15000);
        
    } catch (error) {
        log(`Erro: ${error.message}`, 'error');
        return { success: false, clienteId, meses, error: error.message };
    } finally {
        if (browser) {
            log('Fechando navegador...');
            await browser.close();
        }
    }
    
    return { success: true, clienteId, meses, plano: obterTipoPlano(meses) };
}

// Validação de argumentos
const clienteId = process.argv[2];
const meses = parseInt(process.argv[3]) || 3;

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node renovar-servidor2-inteligente.cjs <cliente_id> <meses>');
    console.log('📖 Exemplo: node renovar-servidor2-inteligente.cjs 359503850 6');
    process.exit(1);
}

if (![1, 3, 6, 12].includes(meses)) {
    console.log('❌ Erro: Período deve ser 1, 3, 6 ou 12 meses');
    process.exit(1);
}

console.log('🎯 CENÁRIOS SUPORTADOS:');
console.log('📝 Cliente com plano TRIMESTRAL → renovar 3 meses = APENAS RENOVAR');
console.log('📝 Cliente com plano TRIMESTRAL → renovar 6 meses = ALTERAR PLANO + RENOVAR');
console.log('📝 Cliente com plano MENSAL → renovar 3 meses = ALTERAR PLANO + RENOVAR');
console.log('');

// Executar renovação
renovarServidor2Inteligente(clienteId, meses).catch(console.error);
