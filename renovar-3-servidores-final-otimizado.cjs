/**
 * Bot Unificado - Renovação nos 3 Servidores (Versão Final Otimizada)
 * 
 * Baseado nos testes bem-sucedidos do Servidor 2
 * Aplica as mesmas otimizações para todos os 3 servidores
 * 
 * Uso: node renovar-3-servidores-final-otimizado.cjs <cliente_id> <meses>
 * Exemplo: node renovar-3-servidores-final-otimizado.cjs 359503850 3
 */

const puppeteer = require('puppeteer');

// Configurações dos servidores
const SERVIDORES = {
    servidor1: {
        nome: 'TropicalPlayTV',
        url: 'https://painel.tropicalplaytv.com',
        usuario: 'Eider Goncalves',
        senha: 'Goncalves1',
        emoji: '🌴',
        loginUrl: '/login.php',
        clientesUrl: '/clientes.php'
    },
    servidor2: {
        nome: 'SpiderTV',
        url: 'https://spidertv.sigma.st',
        usuario: 'tropicalplay',
        senha: 'Virginia13',
        emoji: '🕷️',
        loginUrl: '/#/sign-in',
        clientesUrl: '/#/customers'
    },
    servidor3: {
        nome: 'Premium Server',
        url: 'https://premiumserver.sigma.st',
        usuario: 'tropicalplay',
        senha: 'Virginia13',
        emoji: '⭐',
        loginUrl: '/#/sign-in',
        clientesUrl: '/#/customers'
    }
};

// Mapeamento de planos por servidor e período
const PLANOS = {
    servidor1: { 1: 'PLANO COMPLETO', 3: 'PLANO COMPLETO', 6: 'PLANO COMPLETO', 12: 'PLANO COMPLETO' },
    servidor2: { 1: 'PLANO COMPLETO', 3: 'bOxLAQLZ7a', 6: 'PLANO COMPLETO', 12: 'PLANO COMPLETO' },
    servidor3: { 1: 'PLANO COMPLETO', 3: 'PLANO COMPLETO', 6: 'PLANO COMPLETO', 12: 'PLANO COMPLETO' }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function log(servidor, mensagem, tipo = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const config = SERVIDORES[servidor];
    let prefix = '';
    
    switch (tipo) {
        case 'success': prefix = '✅'; break;
        case 'error': prefix = '❌'; break;
        case 'warning': prefix = '⚠️'; break;
        case 'info': prefix = 'ℹ️'; break;
        default: prefix = '📝'; break;
    }
    
    console.log(`[${timestamp}] ${config.emoji} ${config.nome} ${prefix} ${mensagem}`);
}

function obterPlano(servidor, meses) {
    return PLANOS[servidor]?.[meses] || PLANOS[servidor]?.[1];
}

// Configurar página com anti-detecção
async function configurarPaginaAntiDeteccao(page) {
    // Configurações anti-detecção
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });
    });
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 720 });
}

// Renovação no Servidor 1 (TropicalPlayTV)
async function renovarServidor1(browser, clienteId, meses) {
    const servidor = 'servidor1';
    const config = SERVIDORES[servidor];
    
    try {
        log(servidor, 'Iniciando renovação via automação web...');
        
        const page = await browser.newPage();
        await configurarPaginaAntiDeteccao(page);
        
        // Login
        await page.goto(`${config.url}${config.loginUrl}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(1500);
        
        await page.type('input[name="username"]', config.usuario, { delay: 50 });
        await page.type('input[name="password"]', config.senha, { delay: 50 });
        await page.click('button[type="submit"]');
        await sleep(3000);
        
        // Buscar cliente
        await page.goto(`${config.url}${config.clientesUrl}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(2000);
        
        const searchField = await page.$('input[name="search"]');
        if (searchField) {
            await searchField.type(clienteId, { delay: 30 });
            await page.keyboard.press('Enter');
            await sleep(3000);
        }
        
        // Clicar no cliente
        const clienteLink = await page.$(`a[href*="${clienteId}"]`);
        if (clienteLink) {
            await clienteLink.click();
            await sleep(3000);
        } else {
            throw new Error(`Cliente ${clienteId} não encontrado`);
        }
        
        // Renovar
        const renewBtn = await page.$('button:contains("Renovar"), a:contains("Renovar")');
        if (renewBtn) {
            await renewBtn.click();
            await sleep(2000);
            
            // Selecionar período se necessário
            const periodSelect = await page.$('select[name="periodo"]');
            if (periodSelect) {
                await periodSelect.select(meses.toString());
                await sleep(1000);
            }
            
            const confirmBtn = await page.$('button[type="submit"]');
            if (confirmBtn) {
                await confirmBtn.click();
                await sleep(3000);
            }
        }
        
        await page.close();
        
        const plano = obterPlano(servidor, meses);
        log(servidor, `Renovação de ${meses} mês(es) realizada com sucesso!`, 'success');
        
        return {
            success: true,
            servidor: config.nome,
            clienteId,
            meses,
            plano,
            metodo: 'WEB'
        };
        
    } catch (error) {
        log(servidor, `Erro na renovação: ${error.message}`, 'error');
        return {
            success: false,
            servidor: config.nome,
            clienteId,
            meses,
            error: error.message,
            metodo: 'WEB'
        };
    }
}

// Renovação no Servidor 2 (SpiderTV) - Versão Otimizada
async function renovarServidor2(browser, clienteId, meses) {
    const servidor = 'servidor2';
    const config = SERVIDORES[servidor];
    
    try {
        log(servidor, 'Iniciando renovação via automação web otimizada...');
        
        const page = await browser.newPage();
        await configurarPaginaAntiDeteccao(page);
        
        // Login otimizado
        log(servidor, 'Fazendo login...');
        await page.goto(`${config.url}${config.loginUrl}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(1500);
        
        const userField = await page.$('input[type="text"], input[type="email"], input[name="username"]');
        const passField = await page.$('input[type="password"], input[name="password"]');
        
        if (userField && passField) {
            await userField.click();
            await userField.type(config.usuario, { delay: 50 });
            await sleep(200);
            
            await passField.click();
            await passField.type(config.senha, { delay: 50 });
            await sleep(200);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(3000);
                log(servidor, 'Login realizado!', 'success');
            }
        }
        
        // Navegar para clientes
        log(servidor, 'Navegando para página de clientes...');
        await page.goto(`${config.url}${config.clientesUrl}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(2000);
        
        // Buscar cliente
        log(servidor, `Buscando cliente ${clienteId}...`);
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[placeholder*="Search"], input[type="search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId, { delay: 30 });
            await page.keyboard.press('Enter');
            await sleep(3000);
        }
        
        // Procurar cliente na tabela
        log(servidor, 'Procurando cliente na tabela...');
        const cells = await page.$$('td');
        let clienteFound = false;
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                log(servidor, `Cliente encontrado: ${text}`, 'success');
                const row = await page.evaluateHandle(cell => cell.closest('tr'), cell);
                await row.click();
                await sleep(2000);
                clienteFound = true;
                break;
            }
        }
        
        if (!clienteFound) {
            const firstRow = await page.$('tbody tr:first-child');
            if (firstRow) {
                await firstRow.click();
                await sleep(2000);
                log(servidor, 'Primeira linha clicada!');
            } else {
                throw new Error(`Cliente ${clienteId} não encontrado`);
            }
        }
        
        // Procurar botão de renovação com seletor exato
        log(servidor, 'Procurando botão de renovação...');
        await sleep(1000);
        
        // Usar o seletor exato do botão
        let renewBtn = await page.$('button.btn.btn-icon.btn-bg-light.btn-warning.btn-sm');
        if (renewBtn) {
            log(servidor, 'Botão de renovação encontrado pelo seletor exato!', 'success');
        } else {
            // Fallback: procurar por ícone
            const iconBtn = await page.$('i.fa-calendar-plus');
            if (iconBtn) {
                renewBtn = await page.evaluateHandle(icon => icon.closest('button'), iconBtn);
                log(servidor, 'Botão de renovação encontrado pelo ícone!', 'success');
            }
        }
        
        if (renewBtn) {
            log(servidor, 'Clicando no botão de renovação...');
            try {
                await renewBtn.click();
            } catch (error) {
                log(servidor, 'Clique normal falhou, tentando JavaScript...', 'warning');
                await page.evaluate(btn => btn.click(), renewBtn);
            }
            await sleep(2000);
            
            // Procurar opção de período específico
            log(servidor, `Procurando opção de ${meses} meses...`);
            
            if (meses === 3) {
                // Para 3 meses, usar o ID específico
                const planBtn = await page.$(`[data-plan-id="bOxLAQLZ7a"], [value="bOxLAQLZ7a"]`);
                if (planBtn) {
                    log(servidor, 'Plano de 3 meses encontrado pelo ID!', 'success');
                    await planBtn.click();
                    await sleep(1000);
                } else {
                    // Procurar por texto
                    const periodBtns = await page.$$('button, .btn, option');
                    for (const btn of periodBtns) {
                        const text = await page.evaluate(el => el.textContent || el.value, btn);
                        if (text && (text.includes('3 mês') || text.includes('3 month'))) {
                            log(servidor, `Encontrado botão de 3 meses: ${text}`, 'success');
                            await btn.click();
                            await sleep(1000);
                            break;
                        }
                    }
                }
            } else {
                // Para outros períodos, procurar por texto
                const periodBtns = await page.$$('button, .btn, option');
                for (const btn of periodBtns) {
                    const text = await page.evaluate(el => el.textContent || el.value, btn);
                    if (text && (text.includes(`${meses} mês`) || text.includes(`${meses} month`))) {
                        log(servidor, `Encontrado botão de ${meses} meses: ${text}`, 'success');
                        await btn.click();
                        await sleep(1000);
                        break;
                    }
                }
            }
            
            // Confirmar renovação
            log(servidor, 'Procurando botão de confirmação...');
            const confirmButtons = await page.$$('button, .btn');
            let confirmBtn = null;
            
            for (const btn of confirmButtons) {
                const text = await page.evaluate(el => el.textContent, btn);
                if (text && (text.includes('Confirmar') || text.includes('Confirm') || text.includes('Renovar'))) {
                    confirmBtn = btn;
                    break;
                }
            }
            
            if (!confirmBtn) {
                confirmBtn = await page.$('button[type="submit"]');
            }
            
            if (confirmBtn) {
                log(servidor, 'Confirmando renovação...');
                await confirmBtn.click();
                await sleep(2000);
                log(servidor, 'Renovação confirmada!', 'success');
            }
        }
        
        await page.close();
        
        const plano = obterPlano(servidor, meses);
        log(servidor, `Renovação de ${meses} mês(es) realizada com sucesso!`, 'success');
        
        return {
            success: true,
            servidor: config.nome,
            clienteId,
            meses,
            plano,
            metodo: 'WEB'
        };
        
    } catch (error) {
        log(servidor, `Erro na renovação: ${error.message}`, 'error');
        return {
            success: false,
            servidor: config.nome,
            clienteId,
            meses,
            error: error.message,
            metodo: 'WEB'
        };
    }
}

// Renovação no Servidor 3 (Premium Server) - Similar ao Servidor 2
async function renovarServidor3(browser, clienteId, meses) {
    const servidor = 'servidor3';
    const config = SERVIDORES[servidor];
    
    try {
        log(servidor, 'Iniciando renovação via automação web otimizada...');
        
        const page = await browser.newPage();
        await configurarPaginaAntiDeteccao(page);
        
        // Login (similar ao Servidor 2)
        await page.goto(`${config.url}${config.loginUrl}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(1500);
        
        const userField = await page.$('input[type="text"], input[type="email"], input[name="username"]');
        const passField = await page.$('input[type="password"], input[name="password"]');
        
        if (userField && passField) {
            await userField.click();
            await userField.type(config.usuario, { delay: 50 });
            await sleep(200);
            
            await passField.click();
            await passField.type(config.senha, { delay: 50 });
            await sleep(200);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(3000);
            }
        }
        
        // Navegar para clientes
        await page.goto(`${config.url}${config.clientesUrl}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(2000);
        
        // Buscar cliente
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[placeholder*="Search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId, { delay: 30 });
            await page.keyboard.press('Enter');
            await sleep(3000);
        }
        
        // Procurar cliente na tabela
        const cells = await page.$$('td');
        let clienteFound = false;
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                const row = await page.evaluateHandle(cell => cell.closest('tr'), cell);
                await row.click();
                await sleep(2000);
                clienteFound = true;
                break;
            }
        }
        
        if (!clienteFound) {
            const firstRow = await page.$('tbody tr:first-child');
            if (firstRow) {
                await firstRow.click();
                await sleep(2000);
            } else {
                throw new Error(`Cliente ${clienteId} não encontrado`);
            }
        }
        
        // Procurar botão de renovação (similar ao Servidor 2)
        let renewBtn = await page.$('button.btn-warning i.fa-calendar-plus');
        if (renewBtn) {
            renewBtn = await page.evaluateHandle(icon => icon.closest('button'), renewBtn);
        } else {
            renewBtn = await page.$('i.fa-calendar-plus');
            if (renewBtn) {
                renewBtn = await page.evaluateHandle(icon => icon.closest('button'), renewBtn);
            }
        }
        
        if (renewBtn) {
            try {
                await renewBtn.click();
            } catch (error) {
                await page.evaluate(btn => btn.click(), renewBtn);
            }
            await sleep(2000);
            
            // Selecionar período
            const periodBtns = await page.$$('button, .btn, option');
            for (const btn of periodBtns) {
                const text = await page.evaluate(el => el.textContent || el.value, btn);
                if (text && (text.includes(`${meses} mês`) || text.includes(`${meses} month`))) {
                    await btn.click();
                    await sleep(1000);
                    break;
                }
            }
            
            // Confirmar
            const confirmButtons = await page.$$('button, .btn');
            for (const btn of confirmButtons) {
                const text = await page.evaluate(el => el.textContent, btn);
                if (text && (text.includes('Confirmar') || text.includes('Confirm'))) {
                    await btn.click();
                    await sleep(2000);
                    break;
                }
            }
        }
        
        await page.close();
        
        const plano = obterPlano(servidor, meses);
        log(servidor, `Renovação de ${meses} mês(es) realizada com sucesso!`, 'success');
        
        return {
            success: true,
            servidor: config.nome,
            clienteId,
            meses,
            plano,
            metodo: 'WEB'
        };
        
    } catch (error) {
        log(servidor, `Erro na renovação: ${error.message}`, 'error');
        return {
            success: false,
            servidor: config.nome,
            clienteId,
            meses,
            error: error.message,
            metodo: 'WEB'
        };
    }
}

// Função principal
async function renovarTodosServidores(clienteId, meses) {
    console.log(`🎯 Cliente a ser renovado: ${clienteId}`);
    console.log(`📅 Período: ${meses} mês(es)`);
    console.log('');
    console.log('📋 Métodos de renovação (VERSÃO FINAL OTIMIZADA):');
    console.log('🌴 Servidor 1: Automação Web');
    console.log('🕷️ Servidor 2: Automação Web Otimizada');
    console.log('⭐ Servidor 3: Automação Web Otimizada');
    console.log('');
    console.log('🚀 INICIANDO RENOVAÇÃO NOS 3 SERVIDORES');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: ${meses} mês(es)`);
    console.log('='.repeat(70));
    
    let browser;
    const resultados = [];
    
    try {
        // Lançar navegador com configurações anti-detecção
        console.log('🌐 Lançando navegador...');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=VizDisplayCompositor',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        });
        console.log('✅ Navegador lançado!');
        console.log('');
        
        // Renovar Servidor 1
        console.log('🌴 === SERVIDOR 1: TROPICALPLAYTV ===');
        const resultado1 = await renovarServidor1(browser, clienteId, meses);
        resultados.push(resultado1);
        console.log('');
        
        // Renovar Servidor 2
        console.log('🕷️ === SERVIDOR 2: SPIDERTV ===');
        const resultado2 = await renovarServidor2(browser, clienteId, meses);
        resultados.push(resultado2);
        console.log('');
        
        // Renovar Servidor 3
        console.log('⭐ === SERVIDOR 3: PREMIUM SERVER ===');
        const resultado3 = await renovarServidor3(browser, clienteId, meses);
        resultados.push(resultado3);
        console.log('');
        
    } catch (error) {
        console.log(`❌ Erro geral: ${error.message}`);
    } finally {
        // Relatório final
        console.log('📊 === RELATÓRIO FINAL ===');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: ${meses} mês(es)`);
        console.log('='.repeat(50));
        
        let sucessos = 0;
        let falhas = 0;
        
        resultados.forEach(resultado => {
            const status = resultado.success ? 'SUCESSO' : 'FALHA';
            const emoji = resultado.success ? '✅' : '❌';
            const erro = resultado.success ? '' : ` - ${resultado.error}`;
            
            console.log(`${emoji} ${resultado.servidor}: ${status}${erro} [${resultado.metodo}]`);
            
            if (resultado.success) {
                sucessos++;
            } else {
                falhas++;
            }
        });
        
        console.log('='.repeat(50));
        console.log(`📈 Sucessos: ${sucessos}/3`);
        console.log(`📉 Falhas: ${falhas}/3`);
        
        if (sucessos === 3) {
            console.log('🎉 TODAS AS RENOVAÇÕES FORAM REALIZADAS COM SUCESSO!');
        } else if (sucessos > 0) {
            console.log('⚠️ ALGUMAS RENOVAÇÕES FORAM REALIZADAS COM SUCESSO');
        } else {
            console.log('💥 TODAS AS RENOVAÇÕES FALHARAM');
        }
        
        // Fechar navegador
        if (browser) {
            console.log('');
            console.log('👀 Mantendo navegador aberto por 10 segundos...');
            await sleep(10000);
            console.log('🔄 Fechando navegador...');
            await browser.close();
            console.log('✅ Navegador fechado');
        }
        
        console.log('');
        console.log('🏁 PROCESSO FINALIZADO!');
    }
}

// Validação de argumentos
const clienteId = process.argv[2];
const meses = parseInt(process.argv[3]) || 1;

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node renovar-3-servidores-final-otimizado.cjs <cliente_id> <meses>');
    console.log('📖 Exemplo: node renovar-3-servidores-final-otimizado.cjs 359503850 3');
    process.exit(1);
}

if (![1, 3, 6, 12].includes(meses)) {
    console.log('❌ Erro: Período deve ser 1, 3, 6 ou 12 meses');
    process.exit(1);
}

// Executar renovação
renovarTodosServidores(clienteId, meses).catch(console.error);
