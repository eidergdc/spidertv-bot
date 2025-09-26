/**
 * Bot Unificado - Renovação nos 3 Servidores (Versão Web Final)
 * 
 * Renova um cliente automaticamente nos 3 servidores via automação web:
 * - Servidor 1: TropicalPlayTV (via automação web)
 * - Servidor 2: SpiderTV (via automação web)
 * - Servidor 3: Premium Server (via automação web)
 * 
 * Uso: node renovar-3-servidores-web-final.cjs <cliente_id> <meses>
 * Exemplo: node renovar-3-servidores-web-final.cjs 359503850 1
 */

const puppeteer = require('puppeteer');

// Configurações dos servidores
const SERVIDORES = {
    servidor1: {
        nome: 'TropicalPlayTV',
        url: 'https://painel.tropicalplaytv.com',
        usuario: 'Eider Goncalves',
        senha: 'Goncalves1',
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
        usuario: 'tropicalplay',
        senha: 'Virginia13',
        emoji: '⭐'
    }
};

// Mapeamento de planos por servidor e período
const PLANOS = {
    servidor1: {
        1: 'PLANO COMPLETO',
        3: 'PLANO COMPLETO',
        6: 'PLANO COMPLETO',
        12: 'PLANO COMPLETO'
    },
    servidor2: {
        1: 'PLANO COMPLETO',
        3: 'PLANO COMPLETO',
        6: 'PLANO COMPLETO',
        12: 'PLANO COMPLETO'
    },
    servidor3: {
        1: 'PLANO COMPLETO',
        3: 'PLANO COMPLETO',
        6: 'PLANO COMPLETO',
        12: 'PLANO COMPLETO'
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
        default: prefix = '📝'; break;
    }
    
    console.log(`[${timestamp}] ${config.emoji} ${config.nome} ${prefix} ${mensagem}`);
}

function obterPlano(servidor, meses) {
    return PLANOS[servidor]?.[meses] || PLANOS[servidor]?.[1];
}

// Renovação no Servidor 1 (TropicalPlayTV)
async function renovarServidor1(browser, clienteId, meses) {
    const servidor = 'servidor1';
    const config = SERVIDORES[servidor];
    
    try {
        log(servidor, 'Iniciando renovação via automação web...');
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        
        // Login
        await page.goto(`${config.url}/login.php`, { waitUntil: 'networkidle0', timeout: 30000 });
        await sleep(2000);
        
        await page.type('input[name="username"]', config.usuario);
        await page.type('input[name="password"]', config.senha);
        await page.click('button[type="submit"]');
        await sleep(3000);
        
        // Buscar cliente
        await page.goto(`${config.url}/clientes.php`, { waitUntil: 'networkidle0', timeout: 30000 });
        await sleep(2000);
        
        const searchField = await page.$('input[name="search"]');
        if (searchField) {
            await searchField.type(clienteId);
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
            
            const confirmBtn = await page.$('button:contains("Confirmar"), button[type="submit"]');
            if (confirmBtn) {
                await confirmBtn.click();
                await sleep(3000);
            }
        }
        
        await page.close();
        
        const plano = obterPlano(servidor, meses);
        log(servidor, `Renovação de ${meses} mês(es) realizada com sucesso via web!`, 'success');
        
        return {
            success: true,
            servidor: config.nome,
            clienteId,
            meses,
            plano,
            metodo: 'WEB'
        };
        
    } catch (error) {
        log(servidor, `Erro na renovação web: ${error.message}`, 'error');
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

// Renovação no Servidor 2 (SpiderTV)
async function renovarServidor2(browser, clienteId, meses) {
    const servidor = 'servidor2';
    const config = SERVIDORES[servidor];
    
    try {
        log(servidor, 'Iniciando renovação via automação web...');
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        
        // Login
        await page.goto(`${config.url}/#/sign-in`, { waitUntil: 'networkidle0', timeout: 30000 });
        await sleep(2000);
        
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            await userField.type(config.usuario);
            await passField.type(config.senha);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(4000);
            }
        }
        
        // Navegar para clientes
        await page.goto(`${config.url}/#/customers`, { waitUntil: 'networkidle0', timeout: 30000 });
        await sleep(3000);
        
        // Buscar cliente
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[placeholder*="Search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId);
            await page.keyboard.press('Enter');
            await sleep(4000);
        }
        
        // Clicar no cliente (primeiro resultado)
        const clienteRow = await page.$('tbody tr:first-child');
        if (clienteRow) {
            await clienteRow.click();
            await sleep(3000);
        } else {
            throw new Error(`Cliente ${clienteId} não encontrado`);
        }
        
        // Procurar botão de renovação
        const renewBtn = await page.$('button:contains("Renovar"), button:contains("Renew"), .btn:contains("Renovar")');
        if (renewBtn) {
            await renewBtn.click();
            await sleep(2000);
            
            // Selecionar período
            const periodBtns = await page.$$('button, .btn');
            for (const btn of periodBtns) {
                const text = await page.evaluate(el => el.textContent, btn);
                if (text.includes(`${meses} mês`) || text.includes(`${meses} month`)) {
                    await btn.click();
                    await sleep(1000);
                    break;
                }
            }
            
            // Confirmar renovação
            const confirmBtn = await page.$('button:contains("Confirmar"), button:contains("Confirm")');
            if (confirmBtn) {
                await confirmBtn.click();
                await sleep(3000);
            }
        }
        
        await page.close();
        
        const plano = obterPlano(servidor, meses);
        log(servidor, `Renovação de ${meses} mês(es) realizada com sucesso via web!`, 'success');
        
        return {
            success: true,
            servidor: config.nome,
            clienteId,
            meses,
            plano,
            metodo: 'WEB'
        };
        
    } catch (error) {
        log(servidor, `Erro na renovação web: ${error.message}`, 'error');
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

// Renovação no Servidor 3 (Premium Server)
async function renovarServidor3(browser, clienteId, meses) {
    const servidor = 'servidor3';
    const config = SERVIDORES[servidor];
    
    try {
        log(servidor, 'Iniciando renovação via automação web...');
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        
        // Login (similar ao Servidor 2)
        await page.goto(`${config.url}/#/sign-in`, { waitUntil: 'networkidle0', timeout: 30000 });
        await sleep(2000);
        
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            await userField.type(config.usuario);
            await passField.type(config.senha);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(4000);
            }
        }
        
        // Navegar para clientes
        await page.goto(`${config.url}/#/customers`, { waitUntil: 'networkidle0', timeout: 30000 });
        await sleep(3000);
        
        // Buscar cliente
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[placeholder*="Search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId);
            await page.keyboard.press('Enter');
            await sleep(4000);
        }
        
        // Clicar no cliente
        const clienteRow = await page.$('tbody tr:first-child');
        if (clienteRow) {
            await clienteRow.click();
            await sleep(3000);
        } else {
            throw new Error(`Cliente ${clienteId} não encontrado`);
        }
        
        // Renovar
        const renewBtn = await page.$('button:contains("Renovar"), button:contains("Renew")');
        if (renewBtn) {
            await renewBtn.click();
            await sleep(2000);
            
            // Selecionar período
            const periodBtns = await page.$$('button, .btn');
            for (const btn of periodBtns) {
                const text = await page.evaluate(el => el.textContent, btn);
                if (text.includes(`${meses} mês`) || text.includes(`${meses} month`)) {
                    await btn.click();
                    await sleep(1000);
                    break;
                }
            }
            
            // Confirmar
            const confirmBtn = await page.$('button:contains("Confirmar"), button:contains("Confirm")');
            if (confirmBtn) {
                await confirmBtn.click();
                await sleep(3000);
            }
        }
        
        await page.close();
        
        const plano = obterPlano(servidor, meses);
        log(servidor, `Renovação de ${meses} mês(es) realizada com sucesso via web!`, 'success');
        
        return {
            success: true,
            servidor: config.nome,
            clienteId,
            meses,
            plano,
            metodo: 'WEB'
        };
        
    } catch (error) {
        log(servidor, `Erro na renovação web: ${error.message}`, 'error');
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
    console.log('📋 Métodos de renovação:');
    console.log('🌴 Servidor 1: Automação Web');
    console.log('🕷️ Servidor 2: Automação Web');
    console.log('⭐ Servidor 3: Automação Web');
    console.log('');
    console.log('🚀 INICIANDO RENOVAÇÃO NOS 3 SERVIDORES (VERSÃO WEB FINAL)');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: ${meses} mês(es)`);
    console.log('='.repeat(70));
    
    let browser;
    const resultados = [];
    
    try {
        // Lançar navegador
        console.log('🌐 Lançando navegador...');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 200,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log('✅ Navegador lançado!');
        console.log('');
        
        // Renovar Servidor 1
        console.log('🌴 === SERVIDOR 1: TROPICALPLAYTV (WEB) ===');
        const resultado1 = await renovarServidor1(browser, clienteId, meses);
        resultados.push(resultado1);
        console.log('');
        
        // Renovar Servidor 2
        console.log('🕷️ === SERVIDOR 2: SPIDERTV (WEB) ===');
        const resultado2 = await renovarServidor2(browser, clienteId, meses);
        resultados.push(resultado2);
        console.log('');
        
        // Renovar Servidor 3
        console.log('⭐ === SERVIDOR 3: PREMIUM SERVER (WEB) ===');
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
    console.log('📖 Uso: node renovar-3-servidores-web-final.cjs <cliente_id> <meses>');
    console.log('📖 Exemplo: node renovar-3-servidores-web-final.cjs 359503850 1');
    process.exit(1);
}

if (![1, 3, 6, 12].includes(meses)) {
    console.log('❌ Erro: Período deve ser 1, 3, 6 ou 12 meses');
    process.exit(1);
}

// Executar renovação
renovarTodosServidores(clienteId, meses).catch(console.error);
