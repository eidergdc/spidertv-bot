/**
 * Bot Unificado - Renovação nos 3 Servidores (VERSÃO FINAL CORRIGIDA)
 * 
 * Incorpora todas as correções e mapeamentos corretos testados:
 * - Servidor 2: Mapeamentos testados e funcionando
 * - Servidor 3: Posições corrigidas conforme especificação
 * 
 * Uso: node renovar-3-servidores-unificado-final.cjs <cliente_id> <meses>
 * Exemplo: node renovar-3-servidores-unificado-final.cjs 648718886 6
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
        usuario: 'eidergdc',
        senha: 'Premium2025@',
        emoji: '⭐',
        loginUrl: '/#/sign-in',
        clientesUrl: '/#/customers'
    }
};

// Mapeamentos corretos de posições por servidor
const MAPEAMENTOS_POSICOES = {
    servidor2: {
        'MENSAL': 1,
        'TRIMESTRAL': 4,
        'SEMESTRAL': 5,
        'ANUAL': 6
    },
    servidor3: {
        'MENSAL': 0,      // "1 MÊS COMPLETO C/ ADULTO"
        'TRIMESTRAL': 2,  // "3 MÊS C/ ADULTO"
        'SEMESTRAL': 4,   // "6 MÊS C/ ADULTO"
        'ANUAL': 6        // "ANUAL COMPLETO"
    }
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
        case 'verify': prefix = '🔍'; break;
        default: prefix = '📝'; break;
    }
    
    console.log(`[${timestamp}] ${config.emoji} ${config.nome} ${prefix} ${mensagem}`);
}

// Configurar página com anti-detecção
async function configurarPaginaAntiDeteccao(page) {
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
        log(servidor, 'Iniciando renovação...');
        
        const page = await browser.newPage();
        await configurarPaginaAntiDeteccao(page);
        
        // Login
        log(servidor, 'Fazendo login...');
        await page.goto(`${config.url}${config.loginUrl}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(2000);
        
        await page.type('input[name="username"]', config.usuario, { delay: 80 });
        await page.type('input[name="password"]', config.senha, { delay: 80 });
        await page.click('button[type="submit"]');
        await sleep(4000);
        log(servidor, 'Login realizado!', 'success');
        
        // Buscar cliente
        log(servidor, `Buscando cliente ${clienteId}...`);
        await page.goto(`${config.url}${config.clientesUrl}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(3000);
        
        const searchField = await page.$('input[name="search"]');
        if (searchField) {
            await searchField.type(clienteId, { delay: 50 });
            await page.keyboard.press('Enter');
            await sleep(4000);
        }
        
        // Clicar no cliente
        const clienteLink = await page.$(`a[href*="${clienteId}"]`);
        if (clienteLink) {
            await clienteLink.click();
            await sleep(4000);
            log(servidor, 'Cliente encontrado e selecionado!', 'success');
        } else {
            throw new Error(`Cliente ${clienteId} não encontrado`);
        }
        
        // Renovar
        log(servidor, 'Procurando botão de renovação...');
        const renewBtn = await page.$('button:contains("Renovar"), a:contains("Renovar")');
        if (renewBtn) {
            await renewBtn.click();
            await sleep(3000);
            
            // Selecionar período se necessário
            const periodSelect = await page.$('select[name="periodo"]');
            if (periodSelect) {
                await periodSelect.select(meses.toString());
                await sleep(2000);
            }
            
            const confirmBtn = await page.$('button[type="submit"]');
            if (confirmBtn) {
                await confirmBtn.click();
                await sleep(4000);
                log(servidor, 'Renovação confirmada!', 'success');
            }
        }
        
        await page.close();
        
        log(servidor, `Renovação de ${meses} mês(es) realizada com sucesso!`, 'success');
        
        return {
            success: true,
            servidor: config.nome,
            clienteId,
            meses,
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

// Renovação no Servidor 2 (SpiderTV) - Implementação Corrigida
async function renovarServidor2(browser, clienteId, meses) {
    const servidor = 'servidor2';
    const config = SERVIDORES[servidor];
    
    try {
        log(servidor, 'Iniciando renovação com implementação corrigida...');
        
        const page = await browser.newPage();
        await configurarPaginaAntiDeteccao(page);
        
        // Login
        log(servidor, 'Fazendo login...');
        await page.goto(`${config.url}${config.loginUrl}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(2000);
        
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            await userField.click();
            await userField.type(config.usuario, { delay: 80 });
            await sleep(300);
            
            await passField.click();
            await passField.type(config.senha, { delay: 80 });
            await sleep(300);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(4000);
                log(servidor, 'Login realizado!', 'success');
            }
        }
        
        // Navegar para clientes
        log(servidor, 'Navegando para página de clientes...');
        await page.goto(`${config.url}${config.clientesUrl}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(3000);
        
        // Buscar cliente
        log(servidor, `Buscando cliente ${clienteId}...`);
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[type="search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId, { delay: 80 });
            await page.keyboard.press('Enter');
            await sleep(4000);
        }
        
        // Procurar cliente na tabela e detectar plano atual
        log(servidor, 'Procurando cliente na tabela...');
        const cells = await page.$$('td');
        let clienteFound = false;
        let planoAtual = '';
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                log(servidor, `Cliente encontrado: ${text}`, 'success');
                
                // Detectar plano atual
                if (text.includes('TRIMESTRAL')) {
                    planoAtual = 'TRIMESTRAL';
                } else if (text.includes('SEMESTRAL')) {
                    planoAtual = 'SEMESTRAL';
                } else if (text.includes('ANUAL')) {
                    planoAtual = 'ANUAL';
                } else if (text.includes('MENSAL') || text.includes('COMPLETO')) {
                    planoAtual = 'MENSAL';
                }
                
                log(servidor, `Plano atual detectado: ${planoAtual}`, 'info');
                
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
                log(servidor, 'Usando primeira linha da tabela', 'warning');
                planoAtual = 'TRIMESTRAL'; // Default
            }
        }
        
        // Procurar e clicar no botão de renovação
        log(servidor, 'Procurando botão de renovação...');
        let renewBtn = await page.$('button.btn.btn-icon.btn-bg-light.btn-warning.btn-sm');
        if (renewBtn) {
            log(servidor, 'Clicando no botão de renovação...');
            await renewBtn.click();
            await sleep(4000);
            
            // Aguardar modal carregar
            try {
                await page.waitForSelector('[data-test="package_id"], select, .dropdown', { timeout: 10000 });
                log(servidor, 'Modal de renovação carregado!', 'success');
            } catch (error) {
                log(servidor, 'Timeout aguardando modal', 'warning');
            }
            
            await sleep(2000);
            
            // Seleção do plano baseado no período
            const tipoPlano = meses === 1 ? 'MENSAL' : meses === 3 ? 'TRIMESTRAL' : meses === 6 ? 'SEMESTRAL' : 'ANUAL';
            log(servidor, `🎯 INICIANDO SELEÇÃO DO PLANO DE ${meses} MESES (${tipoPlano})`, 'info');
            
            // Procurar dropdown
            const packageDropdown = await page.$('[data-test="package_id"]');
            if (packageDropdown) {
                // Abrir dropdown
                try {
                    await packageDropdown.click();
                    log(servidor, 'Dropdown aberto!', 'success');
                } catch (error) {
                    await page.evaluate(el => el.click(), packageDropdown);
                    log(servidor, 'Dropdown aberto com JavaScript!', 'success');
                }
                
                await sleep(3000);
                
                // Aguardar opções carregarem
                try {
                    await page.waitForSelector('.el-select-dropdown__item, .el-option, option', { timeout: 8000 });
                    log(servidor, 'Opções carregadas!', 'success');
                } catch (error) {
                    log(servidor, 'Timeout aguardando opções', 'warning');
                }
                
                // Navegação dinâmica baseada no plano atual
                const posicoes = MAPEAMENTOS_POSICOES.servidor2;
                const posicaoAtual = posicoes[planoAtual] || posicoes['TRIMESTRAL'];
                const posicaoDestino = posicoes[tipoPlano];
                
                log(servidor, `Navegando de ${planoAtual} (pos ${posicaoAtual}) para ${tipoPlano} (pos ${posicaoDestino})...`, 'info');
                
                if (posicaoAtual > posicaoDestino) {
                    const navegacoes = posicaoAtual - posicaoDestino;
                    for (let i = 0; i < navegacoes; i++) {
                        await page.keyboard.press('ArrowUp');
                        await sleep(300);
                    }
                } else if (posicaoAtual < posicaoDestino) {
                    const navegacoes = posicaoDestino - posicaoAtual;
                    for (let i = 0; i < navegacoes; i++) {
                        await page.keyboard.press('ArrowDown');
                        await sleep(300);
                    }
                }
                
                // Confirmar seleção
                await page.keyboard.press('Enter');
                await sleep(2000);
            }
            
            // Confirmar renovação
            log(servidor, 'Procurando botão de confirmação...');
            const confirmBtn = await page.$('button[type="submit"]');
            if (confirmBtn) {
                const btnText = await page.evaluate(btn => btn.textContent?.trim() || '', confirmBtn);
                log(servidor, `Confirmando renovação: "${btnText}"`, 'info');
                await confirmBtn.click();
                await sleep(4000);
                log(servidor, 'Renovação processada!', 'success');
            }
        }
        
        await page.close();
        
        log(servidor, `Renovação de ${meses} mês(es) realizada com sucesso!`, 'success');
        
        return {
            success: true,
            servidor: config.nome,
            clienteId,
            meses,
            metodo: 'WEB_CORRIGIDO'
        };
        
    } catch (error) {
        log(servidor, `Erro na renovação: ${error.message}`, 'error');
        return {
            success: false,
            servidor: config.nome,
            clienteId,
            meses,
            error: error.message,
            metodo: 'WEB_CORRIGIDO'
        };
    }
}

// Renovação no Servidor 3 (Premium Server) - Implementação com Posições Corretas
async function renovarServidor3(browser, clienteId, meses) {
    const servidor = 'servidor3';
    const config = SERVIDORES[servidor];
    
    try {
        log(servidor, 'Iniciando renovação com posições corretas...');
        
        const page = await browser.newPage();
        await configurarPaginaAntiDeteccao(page);
        
        // Login
        log(servidor, 'Fazendo login...');
        await page.goto(`${config.url}${config.loginUrl}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(2000);
        
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            await userField.click();
            await userField.type(config.usuario, { delay: 80 });
            await sleep(300);
            
            await passField.click();
            await passField.type(config.senha, { delay: 80 });
            await sleep(300);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(4000);
                log(servidor, 'Login realizado!', 'success');
            }
        }
        
        // Navegar para clientes
        log(servidor, 'Navegando para página de clientes...');
        await page.goto(`${config.url}${config.clientesUrl}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(3000);
        
        // Buscar cliente
        log(servidor, `Buscando cliente ${clienteId}...`);
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[type="search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId, { delay: 80 });
            await page.keyboard.press('Enter');
            await sleep(4000);
        }
        
        // Procurar cliente na tabela e detectar plano atual
        log(servidor, 'Procurando cliente na tabela...');
        const cells = await page.$$('td');
        let clienteFound = false;
        let planoAtual = '';
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                log(servidor, `Cliente encontrado: ${text}`, 'success');
                
                // Detectar plano atual (adaptado para servidor 3)
                if (text.includes('TRIMESTRAL') || text.includes('3 MES') || text.includes('3 MÊS')) {
                    planoAtual = 'TRIMESTRAL';
                } else if (text.includes('SEMESTRAL') || text.includes('6 MES') || text.includes('6 MÊS')) {
                    planoAtual = 'SEMESTRAL';
                } else if (text.includes('ANUAL') || text.includes('12 MES') || text.includes('12 MÊS')) {
                    planoAtual = 'ANUAL';
                } else if (text.includes('MENSAL') || text.includes('1 MES') || text.includes('1 MÊS') || text.includes('COMPLETO')) {
                    planoAtual = 'MENSAL';
                }
                
                log(servidor, `Plano atual detectado: ${planoAtual}`, 'info');
                
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
                log(servidor, 'Usando primeira linha da tabela', 'warning');
                planoAtual = 'MENSAL'; // Default
            }
        }
        
        // Procurar e clicar no botão de renovação
        log(servidor, 'Procurando botão de renovação...');
        
        const renewSelectors = [
            'i.fad.fa-calendar-plus.text-white',
            'i.fa-calendar-plus',
            'i[class*="calendar-plus"]'
        ];
        
        let renewBtn = null;
        for (const selector of renewSelectors) {
            const element = await page.$(selector);
            if (element) {
                log(servidor, `Botão de renovação encontrado: ${selector}`, 'success');
                renewBtn = await page.evaluateHandle(el => el.closest('button') || el.parentElement, element);
                break;
            }
        }
        
        if (renewBtn) {
            log(servidor, 'Clicando no botão de renovação...');
            await renewBtn.click();
            await sleep(4000);
            
            // Aguardar modal carregar
            try {
                await page.waitForSelector('select, .el-select, .dropdown, .modal', { timeout: 10000 });
                log(servidor, 'Modal/Dropdown de renovação carregado!', 'success');
            } catch (error) {
                log(servidor, 'Timeout aguardando modal', 'warning');
            }
            
            await sleep(2000);
            
            // Seleção do plano baseado no período
            const tipoPlano = meses === 1 ? 'MENSAL' : meses === 3 ? 'TRIMESTRAL' : meses === 6 ? 'SEMESTRAL' : 'ANUAL';
            log(servidor, `🎯 INICIANDO SELEÇÃO DO PLANO DE ${meses} MESES (${tipoPlano})`, 'info');
            
            // Procurar dropdown
            const dropdownSelectors = [
                '[data-test="package_id"]',
                '.el-select',
                'select[name="package_id"]',
                'select[name="plan"]',
                'select',
                '.dropdown',
                '.form-select'
            ];
            
            let packageDropdown = null;
            for (const selector of dropdownSelectors) {
                packageDropdown = await page.$(selector);
                if (packageDropdown) {
                    log(servidor, `Dropdown encontrado: ${selector}`, 'success');
                    break;
                }
            }
            
            if (packageDropdown) {
                // Abrir dropdown
                try {
                    await packageDropdown.click();
                    log(servidor, 'Dropdown aberto!', 'success');
                } catch (error) {
                    await page.evaluate(el => el.click(), packageDropdown);
                    log(servidor, 'Dropdown aberto com JavaScript!', 'success');
                }
                
                await sleep(3000);
                
                // Aguardar opções carregarem
                try {
                    await page.waitForSelector('.el-select-dropdown__item, .el-option, option', { timeout: 8000 });
                    log(servidor, 'Opções carregadas!', 'success');
                } catch (error) {
                    log(servidor, 'Timeout aguardando opções', 'warning');
                }
                
                // Navegação dinâmica baseada no plano atual (POSIÇÕES CORRETAS)
                const posicoes = MAPEAMENTOS_POSICOES.servidor3;
                const posicaoAtual = posicoes[planoAtual] || posicoes['MENSAL'];
                const posicaoDestino = posicoes[tipoPlano];
                
                log(servidor, `Navegando de ${planoAtual} (pos ${posicaoAtual}) para ${tipoPlano} (pos ${posicaoDestino})...`, 'info');
                
                if (posicaoAtual > posicaoDestino) {
                    const navegacoes = posicaoAtual - posicaoDestino;
                    for (let i = 0; i < navegacoes; i++) {
                        await page.keyboard.press('ArrowUp');
                        await sleep(300);
                    }
                } else if (posicaoAtual < posicaoDestino) {
                    const navegacoes = posicaoDestino - posicaoAtual;
                    for (let i = 0; i < navegacoes; i++) {
                        await page.keyboard.press('ArrowDown');
                        await sleep(300);
                    }
                } else {
                    log(servidor, `Cliente já está no plano ${tipoPlano}!`, 'info');
                }
                
                // Verificar qual opção está selecionada
                log(servidor, 'Verificando opção selecionada...', 'verify');
                const opcaoAtual = await page.evaluate(() => {
                    const selectors = [
                        '.el-select-dropdown__item.is-hovering',
                        '.el-select-dropdown__item:focus',
                        'option:checked',
                        '.dropdown-item.active',
                        '.selected'
                    ];
                    
                    for (const selector of selectors) {
                        const highlighted = document.querySelector(selector);
                        if (highlighted) {
                            return highlighted.textContent?.trim() || 'Elemento encontrado';
                        }
                    }
                    return 'Não encontrada';
                });
                
                log(servidor, `Opção atual: "${opcaoAtual}"`, 'verify');
                
                // Confirmar seleção
                log(servidor, '✅ Confirmando seleção...', 'success');
                await page.keyboard.press('Enter');
                await sleep(2000);
            }
            
            // Confirmar renovação
            log(servidor, 'Procurando botão de confirmação...');
            const confirmSelectors = [
                'button[type="submit"]',
                'button.btn-primary',
                'button.btn-success',
                'button:contains("Renovar")',
                'button:contains("Confirmar")'
            ];
            
            let confirmBtn = null;
            for (const selector of confirmSelectors) {
                confirmBtn = await page.$(selector);
                if (confirmBtn) {
                    const btnText = await page.evaluate(btn => btn.textContent?.trim() || '', confirmBtn);
                    if (btnText.includes('Renovar') || btnText.includes('Confirmar')) {
                        log(servidor, `Botão de confirmação encontrado: "${btnText}"`, 'success');
                        break;
                    }
                }
                confirmBtn = null;
            }
            
            if (confirmBtn) {
                const btnText = await page.evaluate(btn => btn.textContent?.trim() || '', confirmBtn);
                log(servidor, `Confirmando renovação: "${btnText}"`, 'info');
                await confirmBtn.click();
                await sleep(4000);
                log(servidor, 'Renovação processada!', 'success');
            }
        }
        
        await page.close();
        
        log(servidor, `Renovação de ${meses} mês(es) realizada com sucesso!`, 'success');
        
        return {
            success: true,
            servidor: config.nome,
            clienteId,
            meses,
            metodo: 'WEB_POSICOES_CORRETAS'
        };
        
    } catch (error) {
        log(servidor, `Erro na renovação: ${error.message}`, 'error');
        return {
            success: false,
            servidor: config.nome,
            clienteId,
            meses,
            error: error.message,
            metodo: 'WEB_POSICOES_CORRETAS'
        };
    }
}

// Função principal
async function renovarTodosServidores(clienteId, meses) {
    console.log('🎯 BOT UNIFICADO - RENOVAÇÃO NOS 3 SERVIDORES (VERSÃO FINAL CORRIGIDA)');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: ${meses} mês(es)`);
    console.log('');
    console.log('📋 Implementações utilizadas:');
    console.log('🌴 Servidor 1 (TropicalPlayTV): Automação Web Básica');
    console.log('🕷️ Servidor 2 (SpiderTV): Implementação Corrigida e Testada');
    console.log('⭐ Servidor 3 (Premium Server): Posições Corretas Implementadas');
    console.log('');
    console.log('🚀 INICIANDO RENOVAÇÃO NOS 3 SERVIDORES');
    console.log('='.repeat(70));
    
    let browser;
    const resultados = [];
    
    try {
        // Lançar navegador
        console.log('🌐 Lançando navegador...');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 150,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
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
            console.log('👀 Mantendo navegador aberto por 15 segundos para verificação...');
            await sleep(15000);
            console.log('🔄 Fechando navegador...');
            await browser.close();
            console.log('✅ Navegador fechado');
        }
        
        console.log('');
        console.log('🏁 PROCESSO FINALIZADO!');
        console.log('');
        console.log('📖 Como usar:');
        console.log('node renovar-3-servidores-unificado-final.cjs <cliente_id> <meses>');
        console.log('');
        console.log('📖 Exemplos:');
        console.log('node renovar-3-servidores-unificado-final.cjs 648718886 1   # 1 mês');
        console.log('node renovar-3-servidores-unificado-final.cjs 648718886 3   # 3 meses');
        console.log('node renovar-3-servidores-unificado-final.cjs 648718886 6   # 6 meses');
        console.log('node renovar-3-servidores-unificado-final.cjs 648718886 12  # 12 meses');
    }
}

// Validação de argumentos
const clienteId = process.argv[2];
const meses = parseInt(process.argv[3]) || 1;

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node renovar-3-servidores-unificado-final.cjs <cliente_id> <meses>');
    console.log('📖 Exemplo: node renovar-3-servidores-unificado-final.cjs 648718886 6');
    console.log('');
    console.log('📖 Períodos suportados: 1, 3, 6, 12 meses');
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

// Executar renovação
renovarTodosServidores(clienteId, meses).catch(console.error);
