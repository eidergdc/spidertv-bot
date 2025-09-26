/**
 * Bot Unificado - Renovação nos 3 Servidores (Execução PARALELA)
 * 
 * Executa as renovações SIMULTANEAMENTE nos 3 servidores:
 * - Servidor 1 (TropicalPlayTV): Execução paralela
 * - Servidor 2 (SpiderTV): Execução paralela  
 * - Servidor 3 (Premium Server): Execução paralela
 * 
 * Uso: node renovar-3-servidores-paralelo.cjs <cliente_id> <meses>
 * Exemplo: node renovar-3-servidores-paralelo.cjs 648718886 6
 */

const puppeteer = require('puppeteer');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function log(mensagem, tipo = 'info', servidor = 'GERAL') {
    const timestamp = new Date().toLocaleTimeString();
    let prefix = '';
    let emoji = '';
    
    switch (tipo) {
        case 'success': prefix = '✅'; break;
        case 'error': prefix = '❌'; break;
        case 'warning': prefix = '⚠️'; break;
        case 'info': prefix = 'ℹ️'; break;
        case 'header': prefix = '🎯'; break;
        case 'verify': prefix = '🔍'; break;
        default: prefix = '📝'; break;
    }
    
    switch (servidor) {
        case 'TropicalPlayTV': emoji = '🌴'; break;
        case 'SpiderTV': emoji = '🕷️'; break;
        case 'Premium Server': emoji = '⭐'; break;
        default: emoji = '🤖'; break;
    }
    
    console.log(`[${timestamp}] ${emoji} ${servidor} ${prefix} ${mensagem}`);
}

// SERVIDOR 1 - TropicalPlayTV
async function renovarServidor1(clienteId, meses) {
    const servidor = 'TropicalPlayTV';
    let browser;
    let page;
    
    try {
        log('Iniciando renovação...', 'header', servidor);
        
        // Lançar navegador
        log('Lançando navegador...', 'info', servidor);
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
        
        // Configurações anti-detecção
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 720 });
        
        // Login
        log('Fazendo login...', 'info', servidor);
        await page.goto('https://painel.tropicalplaytv.com/', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(3000);
        
        const userField = await page.$('#username');
        const passField = await page.$('#password');
        
        if (userField && passField) {
            await userField.click();
            await userField.type('Eider Goncalves', { delay: 80 });
            await sleep(300);
            
            await passField.click();
            await passField.type('Goncalves1@', { delay: 80 });
            await sleep(300);
            
            const loginBtn = await page.$('#button-login');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(4000);
                log('Login realizado!', 'success', servidor);
            }
        } else {
            throw new Error('Campos de login não encontrados');
        }
        
        // Navegar para clientes
        log('Navegando para página de clientes...', 'info', servidor);
        await page.goto('https://painel.tropicalplaytv.com/iptv/clients', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(3000);
        
        // Buscar cliente
        log(`Buscando cliente ${clienteId}...`, 'info', servidor);
        const searchField = await page.$('input[type="search"].form-control.form-control-sm');
        if (searchField) {
            await searchField.click();
            await searchField.type(clienteId, { delay: 80 });
            await page.keyboard.press('Enter');
            await sleep(4000);
            log('Busca realizada!', 'success', servidor);
        } else {
            throw new Error('Campo de busca não encontrado');
        }
        
        // Clicar no botão calendar
        log('Procurando botão de renovação (calendar)...', 'info', servidor);
        const calendarIcon = await page.$('i.fad.fa-calendar-alt');
        
        if (calendarIcon) {
            log('Ícone de calendar encontrado!', 'success', servidor);
            await calendarIcon.click();
            await sleep(3000);
            
            // Aguardar modal
            log('Aguardando modal de renovação...', 'info', servidor);
            await page.waitForSelector('.bootbox.modal.fade.show', { timeout: 10000 });
            log('Modal de renovação aberto!', 'success', servidor);
            
            // Inserir meses
            log(`Inserindo quantidade de meses (${meses})...`, 'info', servidor);
            const monthsField = await page.$('#months');
            if (monthsField) {
                await monthsField.click({ clickCount: 3 });
                await monthsField.type(meses.toString(), { delay: 100 });
                await sleep(1000);
                log(`${meses} meses inserido no campo!`, 'success', servidor);
            } else {
                throw new Error('Campo de meses não encontrado');
            }
            
            // Confirmar
            log('Procurando botão Confirmar...', 'info', servidor);
            const confirmBtn = await page.$('.btn.btn-info.btnrenewplus');
            if (confirmBtn) {
                log('Clicando no botão Confirmar...', 'info', servidor);
                await confirmBtn.click();
                await sleep(4000);
                log('Renovação confirmada!', 'success', servidor);
            } else {
                throw new Error('Botão Confirmar não encontrado');
            }
            
        } else {
            throw new Error('Ícone de calendar não encontrado');
        }
        
        log(`Renovação de ${meses} meses concluída!`, 'success', servidor);
        return { success: true, servidor, meses };
        
    } catch (error) {
        log(`Erro: ${error.message}`, 'error', servidor);
        return { success: false, servidor, error: error.message, meses };
    } finally {
        if (browser) {
            log('Fechando navegador...', 'info', servidor);
            await browser.close();
        }
    }
}

// SERVIDOR 2 - SpiderTV
async function renovarServidor2(clienteId, meses) {
    const servidor = 'SpiderTV';
    let browser;
    let page;
    
    try {
        log('Iniciando renovação...', 'header', servidor);
        
        // Lançar navegador
        log('Lançando navegador...', 'info', servidor);
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
        
        // Configurações anti-detecção
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 720 });
        
        // Login
        log('Fazendo login...', 'info', servidor);
        await page.goto('https://spidertv.sigma.st/#/sign-in', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(2000);
        
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            await userField.click();
            await userField.type('eidergdc', { delay: 80 });
            await sleep(300);
            
            await passField.click();
            await passField.type('Goncalves1@', { delay: 80 });
            await sleep(300);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(4000);
                log('Login realizado!', 'success', servidor);
            }
        }
        
        // Navegar para clientes
        log('Navegando para página de clientes...', 'info', servidor);
        await page.goto('https://spidertv.sigma.st/#/customers', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(3000);
        
        // Buscar cliente
        log(`Buscando cliente ${clienteId}...`, 'info', servidor);
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[type="search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId, { delay: 80 });
            await page.keyboard.press('Enter');
            await sleep(4000);
        }
        
        // Procurar cliente na tabela
        log('Procurando cliente na tabela...', 'info', servidor);
        const cells = await page.$$('td');
        let clienteFound = false;
        let planoAtual = '';
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                log(`Cliente encontrado: ${text}`, 'success', servidor);
                
                // Detectar plano atual
                if (text.includes('TRIMESTRAL')) {
                    planoAtual = 'TRIMESTRAL';
                } else if (text.includes('SEMESTRAL')) {
                    planoAtual = 'SEMESTRAL';
                } else if (text.includes('ANUAL')) {
                    planoAtual = 'ANUAL';
                } else if (text.includes('BIMESTRAL')) {
                    planoAtual = 'BIMESTRAL';
                } else {
                    planoAtual = 'MENSAL';
                }
                
                log(`Plano atual detectado: ${planoAtual}`, 'info', servidor);
                
                const row = await page.evaluateHandle(cell => cell.closest('tr'), cell);
                await row.click();
                await sleep(3000);
                clienteFound = true;
                break;
            }
        }
        
        if (!clienteFound) {
            throw new Error('Cliente não encontrado');
        }
        
        // Procurar botão de renovação
        log('Procurando botão de renovação...', 'info', servidor);
        let renewBtn = await page.$('button.btn.btn-icon.btn-bg-light.btn-warning.btn-sm');
        
        if (renewBtn) {
            log('Clicando no botão de renovação...', 'info', servidor);
            await renewBtn.click();
            await sleep(4000);
            
            // Aguardar modal carregar
            try {
                await page.waitForSelector('select, .el-select, .dropdown, .modal', { timeout: 10000 });
                log('Modal de renovação carregado!', 'success', servidor);
            } catch (error) {
                log('Timeout aguardando modal', 'warning', servidor);
            }
            
            await sleep(2000);
            
            // Seleção do plano baseado nos meses
            log(`🎯 INICIANDO SELEÇÃO DO PLANO DE ${meses} MESES`, 'info', servidor);
            
            // Procurar dropdown
            const packageDropdown = await page.$('[data-test="package_id"]');
            
            if (packageDropdown) {
                log('Dropdown encontrado!', 'success', servidor);
                
                // Abrir dropdown
                log('Abrindo dropdown...', 'info', servidor);
                await packageDropdown.click();
                await sleep(3000);
                
                // Aguardar opções carregarem
                try {
                    await page.waitForSelector('.el-select-dropdown__item, .el-option, option', { timeout: 8000 });
                    log('Opções carregadas!', 'success', servidor);
                } catch (error) {
                    log('Timeout aguardando opções', 'warning', servidor);
                }
                
                // Mapeamento de posições para servidor 2
                const posicoes = {
                    'MENSAL': 1,
                    'BIMESTRAL': 2,
                    'TRIMESTRAL': 3,
                    'SEMESTRAL': 4,
                    'ANUAL': 5
                };
                
                const mesesParaPlano = {
                    1: 'MENSAL',
                    3: 'TRIMESTRAL', 
                    6: 'SEMESTRAL',
                    12: 'ANUAL'
                };
                
                const planoDestino = mesesParaPlano[meses];
                const posicaoAtual = posicoes[planoAtual] || 1;
                const posicaoDestino = posicoes[planoDestino];
                
                log(`Navegando de ${planoAtual} para ${planoDestino}...`, 'info', servidor);
                
                if (posicaoAtual > posicaoDestino) {
                    // Navegar para cima
                    const navegacoes = posicaoAtual - posicaoDestino;
                    for (let i = 0; i < navegacoes; i++) {
                        await page.keyboard.press('ArrowUp');
                        await sleep(300);
                    }
                } else if (posicaoAtual < posicaoDestino) {
                    // Navegar para baixo
                    const navegacoes = posicaoDestino - posicaoAtual;
                    for (let i = 0; i < navegacoes; i++) {
                        await page.keyboard.press('ArrowDown');
                        await sleep(300);
                    }
                }
                
                // Confirmar seleção
                log('Confirmando seleção...', 'success', servidor);
                await page.keyboard.press('Enter');
                await sleep(2000);
                
            } else {
                log('Dropdown não encontrado', 'error', servidor);
            }
            
            // Confirmar renovação
            await sleep(3000);
            log('Procurando botão de confirmação...', 'info', servidor);
            const confirmBtn = await page.$('button[type="submit"]');
            
            if (confirmBtn) {
                log('Confirmando renovação...', 'info', servidor);
                await confirmBtn.click();
                await sleep(4000);
                log('Renovação processada!', 'success', servidor);
            }
            
        } else {
            throw new Error('Botão de renovação não encontrado');
        }
        
        log(`Renovação de ${meses} meses concluída!`, 'success', servidor);
        return { success: true, servidor, meses };
        
    } catch (error) {
        log(`Erro: ${error.message}`, 'error', servidor);
        return { success: false, servidor, error: error.message, meses };
    } finally {
        if (browser) {
            log('Fechando navegador...', 'info', servidor);
            await browser.close();
        }
    }
}

// SERVIDOR 3 - Premium Server
async function renovarServidor3(clienteId, meses) {
    const servidor = 'Premium Server';
    let browser;
    let page;
    
    try {
        log('Iniciando renovação...', 'header', servidor);
        
        // Lançar navegador
        log('Lançando navegador...', 'info', servidor);
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
        
        // Configurações anti-detecção
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 720 });
        
        // Login
        log('Fazendo login...', 'info', servidor);
        await page.goto('https://premiumserver.sigma.st/#/sign-in', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(2000);
        
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            await userField.click();
            await userField.type('eidergdc', { delay: 80 });
            await sleep(300);
            
            await passField.click();
            await passField.type('Premium2025@', { delay: 80 });
            await sleep(300);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(4000);
                log('Login realizado!', 'success', servidor);
            }
        }
        
        // Navegar para clientes
        log('Navegando para página de clientes...', 'info', servidor);
        await page.goto('https://premiumserver.sigma.st/#/customers', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(3000);
        
        // Buscar cliente
        log(`Buscando cliente ${clienteId}...`, 'info', servidor);
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[type="search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId, { delay: 80 });
            await page.keyboard.press('Enter');
            await sleep(4000);
        }
        
        // Procurar cliente na tabela
        log('Procurando cliente na tabela...', 'info', servidor);
        const cells = await page.$$('td');
        let clienteFound = false;
        let planoAtual = '';
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                log(`Cliente encontrado: ${text}`, 'success', servidor);
                
                // Detectar plano atual
                if (text.includes('TRIMESTRAL') || text.includes('3 MES') || text.includes('3 MÊS')) {
                    planoAtual = 'TRIMESTRAL';
                } else if (text.includes('SEMESTRAL') || text.includes('6 MES') || text.includes('6 MÊS')) {
                    planoAtual = 'SEMESTRAL';
                } else if (text.includes('ANUAL') || text.includes('12 MES') || text.includes('12 MÊS')) {
                    planoAtual = 'ANUAL';
                } else {
                    planoAtual = 'MENSAL';
                }
                
                log(`Plano atual detectado: ${planoAtual}`, 'info', servidor);
                
                const row = await page.evaluateHandle(cell => cell.closest('tr'), cell);
                await row.click();
                await sleep(3000);
                clienteFound = true;
                break;
            }
        }
        
        if (!clienteFound) {
            throw new Error('Cliente não encontrado');
        }
        
        // Procurar botão de renovação
        log('Procurando botão de renovação...', 'info', servidor);
        const renewBtn = await page.$('i.fad.fa-calendar-plus.text-white');
        
        if (renewBtn) {
            const button = await page.evaluateHandle(el => el.closest('button') || el.parentElement, renewBtn);
            log('Clicando no botão de renovação...', 'info', servidor);
            await button.click();
            await sleep(4000);
            
            // Aguardar modal carregar
            try {
                await page.waitForSelector('select, .el-select, .dropdown, .modal', { timeout: 10000 });
                log('Modal/Dropdown de renovação carregado!', 'success', servidor);
            } catch (error) {
                log('Timeout aguardando modal', 'warning', servidor);
            }
            
            await sleep(2000);
            
            // Seleção do plano
            log(`🎯 INICIANDO SELEÇÃO DO PLANO DE ${meses} MESES`, 'info', servidor);
            
            // Procurar dropdown
            const packageDropdown = await page.$('[data-test="package_id"]');
            
            if (packageDropdown) {
                log('Dropdown encontrado!', 'success', servidor);
                
                // Abrir dropdown
                log('Abrindo dropdown...', 'info', servidor);
                await packageDropdown.click();
                await sleep(3000);
                
                // Aguardar opções carregarem
                try {
                    await page.waitForSelector('.el-select-dropdown__item, .el-option, option', { timeout: 8000 });
                    log('Opções carregadas!', 'success', servidor);
                } catch (error) {
                    log('Timeout aguardando opções', 'warning', servidor);
                }
                
                // Mapeamento de posições para servidor 3 (CORRETO)
                const posicoes = {
                    'MENSAL': 0,      // "1 MÊS COMPLETO C/ ADULTO"
                    'TRIMESTRAL': 2,  // "3 MÊS C/ ADULTO"
                    'SEMESTRAL': 4,   // "6 MÊS C/ ADULTO"
                    'ANUAL': 6,       // "ANUAL COMPLETO"
                };
                
                const mesesParaPlano = {
                    1: 'MENSAL',
                    3: 'TRIMESTRAL',
                    6: 'SEMESTRAL', 
                    12: 'ANUAL'
                };
                
                const planoDestino = mesesParaPlano[meses];
                const posicaoAtual = posicoes[planoAtual] || 0;
                const posicaoDestino = posicoes[planoDestino];
                
                log(`Navegando de ${planoAtual} para ${planoDestino}...`, 'info', servidor);
                
                if (posicaoAtual > posicaoDestino) {
                    // Navegar para cima
                    const navegacoes = posicaoAtual - posicaoDestino;
                    for (let i = 0; i < navegacoes; i++) {
                        await page.keyboard.press('ArrowUp');
                        await sleep(300);
                    }
                } else if (posicaoAtual < posicaoDestino) {
                    // Navegar para baixo
                    const navegacoes = posicaoDestino - posicaoAtual;
                    for (let i = 0; i < navegacoes; i++) {
                        await page.keyboard.press('ArrowDown');
                        await sleep(300);
                    }
                }
                
                // Confirmar seleção
                log('Confirmando seleção...', 'success', servidor);
                await page.keyboard.press('Enter');
                await sleep(2000);
                
            } else {
                log('Dropdown não encontrado', 'error', servidor);
            }
            
            // Confirmar renovação
            await sleep(3000);
            log('Procurando botão de confirmação...', 'info', servidor);
            const confirmBtn = await page.$('button[type="submit"]');
            
            if (confirmBtn) {
                log('Confirmando renovação...', 'info', servidor);
                await confirmBtn.click();
                await sleep(4000);
                log('Renovação processada!', 'success', servidor);
            }
            
        } else {
            throw new Error('Botão de renovação não encontrado');
        }
        
        log(`Renovação de ${meses} meses concluída!`, 'success', servidor);
        return { success: true, servidor, meses };
        
    } catch (error) {
        log(`Erro: ${error.message}`, 'error', servidor);
        return { success: false, servidor, error: error.message, meses };
    } finally {
        if (browser) {
            log('Fechando navegador...', 'info', servidor);
            await browser.close();
        }
    }
}

// Função principal - EXECUÇÃO PARALELA
async function renovarTodosServidoresParalelo(clienteId, meses) {
    console.log('🎯 BOT UNIFICADO - RENOVAÇÃO NOS 3 SERVIDORES (EXECUÇÃO PARALELA)');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: ${meses} mês(es)`);
    console.log('');
    console.log('🚀 Estratégia: Execução SIMULTÂNEA nos 3 servidores');
    console.log('🌴 Servidor 1 (TropicalPlayTV): Execução paralela');
    console.log('🕷️ Servidor 2 (SpiderTV): Execução paralela');
    console.log('⭐ Servidor 3 (Premium Server): Execução paralela');
    console.log('');
    console.log('⚡ INICIANDO RENOVAÇÃO PARALELA - TODOS OS SERVIDORES SIMULTANEAMENTE');
    console.log('='.repeat(80));
    
    try {
        // Executar TODOS os servidores em PARALELO
        log('🚀 Iniciando renovações SIMULTÂNEAS nos 3 servidores...', 'header', 'PARALELO');
        
        const promessas = [
            renovarServidor1(clienteId, meses),
            renovarServidor2(clienteId, meses), 
            renovarServidor3(clienteId, meses)
        ];
        
        // Aguardar TODAS as renovações terminarem
        log('⏳ Aguardando conclusão de todas as renovações...', 'info', 'PARALELO');
        const resultados = await Promise.all(promessas);
        
        // Relatório final
        console.log('');
        console.log('📊 === RELATÓRIO FINAL (EXECUÇÃO PARALELA) ===');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: ${meses} mês(es)`);
        console.log('='.repeat(60));
        
        let sucessos = 0;
        let falhas = 0;
        
        resultados.forEach(resultado => {
            const status = resultado.success ? 'SUCESSO' : 'FALHA';
            const emoji = resultado.success ? '✅' : '❌';
            const erro = resultado.success ? '' : ` - ${resultado.error || 'Erro desconhecido'}`;
            
            console.log(`${emoji} ${resultado.servidor}: ${status}${erro}`);
            
            if (resultado.success) {
                sucessos++;
            } else {
                falhas++;
            }
        });
        
        console.log('='.repeat(60));
        console.log(`📈 Sucessos: ${sucessos}/${resultados.length}`);
        console.log(`📉 Falhas: ${falhas}/${resultados.length}`);
        
        if (sucessos === resultados.length) {
            console.log('🎉 TODAS AS RENOVAÇÕES FORAM REALIZADAS COM SUCESSO (PARALELO)!');
        } else if (sucessos > 0) {
            console.log('⚠️ ALGUMAS RENOVAÇÕES FORAM REALIZADAS COM SUCESSO (PARALELO)');
        } else {
            console.log('💥 TODAS AS RENOVAÇÕES FALHARAM (PARALELO)');
        }
        
        console.log('');
        console.log('⚡ VANTAGEM DA EXECUÇÃO PARALELA:');
        console.log('- Muito mais rápido (3x mais rápido que sequencial)');
        console.log('- Todos os navegadores abrem simultaneamente');
        console.log('- Renovações acontecem ao mesmo tempo');
        console.log('- Economia significativa de tempo total');
        
    } catch (error) {
        log(`❌ Erro geral: ${error.message}`, 'error', 'PARALELO');
    } finally {
        console.log('');
        console.log('🏁 PROCESSO PARALELO FINALIZADO!');
        console.log('');
        console.log('📖 Como usar:');
        console.log('node renovar-3-servidores-paralelo.cjs <cliente_id> <meses>');
        console.log('');
        console.log('📖 Exemplos:');
        console.log('node renovar-3-servidores-paralelo.cjs 648718886 1   # 1 mês');
        console.log('node renovar-3-servidores-paralelo.cjs 648718886 3   # 3 meses');
        console.log('node renovar-3-servidores-paralelo.cjs 648718886 6   # 6 meses');
        console.log('node renovar-3-servidores-paralelo.cjs 648718886 12  # 12 meses');
        console.log('');
        console.log('📖 Scripts utilizados:');
        console.log('🌴 TropicalPlayTV: Função integrada (paralela)');
        console.log('🕷️ SpiderTV: Função integrada (paralela)');
        console.log('⭐ Premium Server: Função integrada (paralela)');
    }
}

// Validação de argumentos
const clienteId = process.argv[2];
const meses = parseInt(process.argv[3]) || 1;

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node renovar-3-servidores-paralelo.cjs <cliente_id> <meses>');
    console.log('📖 Exemplo: node renovar-3-servidores-paralelo.cjs 648718886 6');
    console.log('');
    console.log('📖 Períodos suportados: 1, 3, 6, 12 meses');
    console.log('');
    console.log('⚡ EXECUÇÃO PARALELA:');
    console.log('- Abre os 3 navegadores simultaneamente');
    console.log('- Renovações acontecem ao mesmo tempo');
    console.log('- 3x mais rápido que a execução sequencial');
    console.log('');
    console.log('📖 Posições corretas implementadas:');
    console.log('⭐ Servidor 3 (Premium Server):');
    console.log('   - 1 mês: Posição 0 ("1 MÊS COMPLETO C/ ADULTO")');
    console.log('   - 3 meses: Posição 2 ("3 MÊS C/ ADULTO")');
    console.log('   - 6 meses: Posição 4 ("6 MÊS C/ ADULTO")');
    console.log('   - 12 meses: Posição 6 ("ANUAL COMPLETO")');
    process.exit(1);
}

if (![1, 3, 6, 12].includes(meses)) {
    console.log('❌ Erro: Período deve ser 1, 3, 6 ou 12 meses');
    console.log('📖 Períodos suportados: 1, 3, 6, 12');
    process.exit(1);
}

// Executar renovação PARALELA
renovarTodosServidoresParalelo(clienteId, meses).catch(console.error);
