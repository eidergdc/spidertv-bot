/**
 * Renovação Servidor 1 - 1 Mês CORRETO
 * 
 * TropicalPlayTV - Renovação via automação web
 * Baseado na implementação que funcionava no arquivo renovar-3-servidores-web-final.cjs
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
        case 'verify': prefix = '🔍'; break;
        default: prefix = '📝'; break;
    }
    
    console.log(`[${timestamp}] 🌴 TropicalPlayTV ${prefix} ${mensagem}`);
}

async function renovarServidor1(clienteId, periodoMeses) {
    console.log(`🎯 RENOVAÇÃO SERVIDOR 1 - ${periodoMeses} MÊS(ES) CORRETO`);
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: ${periodoMeses} mês(es) (PLANO COMPLETO)`);
    console.log('='.repeat(60));
    
    let browser;
    let page;
    
    try {
        // Lançar navegador
        log('Lançando navegador...');
        browser = await puppeteer.launch({
            headless: false,
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
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
        log('Fazendo login...');
        await page.goto('https://painel.tropicalplaytv.com/', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(2000);
        
        const userField = await page.$('input[name="username"]');
        const passField = await page.$('input[name="password"]');
        
        if (userField && passField) {
            await userField.click();
            await page.evaluate((text, element) => {
                element.value = text;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, 'Eider Goncalves', await page.evaluateHandle(() => document.activeElement));
            await sleep(100);
            
            await passField.click();
            await page.evaluate((text, element) => {
                element.value = text;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, 'Goncalves1@', await page.evaluateHandle(() => document.activeElement));
            await sleep(100);
            
            const loginBtn = await page.$('#button-login');
            if (loginBtn) {
                log('Clicando no botão de login...');
                await loginBtn.click();
                await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 });
                const currentUrl = page.url();
                log(`URL após login: ${currentUrl}`, 'info');
                if (currentUrl.includes('dashboard')) {
                    log('Login realizado!', 'success');
                } else {
                    log('Login pode ter falhado', 'warning');
                    await page.screenshot({ path: 'debug-login.png', fullPage: true });
                }
            } else {
                log('Botão de login não encontrado', 'error');
                await page.screenshot({ path: 'debug-login-no-btn.png', fullPage: true });
            }
        }
        
        // Buscar cliente
        log(`Buscando cliente ${clienteId}...`);
        await page.goto('https://painel.tropicalplaytv.com/iptv/clients', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        await sleep(3000);
        
        const searchField = await page.$('input[type="search"]');
        if (searchField) {
            await searchField.click();
            await searchField.evaluate((el, text) => {
                el.value = text;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }, clienteId);
            await page.keyboard.press('Enter');
            // Tentar clicar no botão de pesquisa se existir
            const searchBtn = await page.$('button[type="submit"]');
            if (searchBtn) {
                await searchBtn.click();
                await sleep(1000);
            }
            await sleep(2000);
            await page.screenshot({ path: 'debug-search.png', fullPage: true });
        }
        
        // Procurar cliente na tabela
        log('Procurando cliente na tabela...');
        const rows = await page.$$('tbody tr');
        let clienteRow = null;
        for (const row of rows) {
            const text = await row.evaluate(el => el.textContent);
            if (text.includes(clienteId)) {
                clienteRow = row;
                break;
            }
        }
        if (!clienteRow) {
            throw new Error(`Cliente ${clienteId} não encontrado na tabela`);
        }
        log('Cliente encontrado na tabela!', 'success');
        
        // Procurar botão calendar na linha do cliente
        log('Procurando botão calendar na linha do cliente...');
        const calendarBtn = await clienteRow.$('i.fad.fa-calendar-alt, i.fas.fa-calendar-alt, i.far.fa-calendar-alt');
        if (!calendarBtn) {
            throw new Error('Botão calendar não encontrado na linha do cliente');
        }
        await calendarBtn.click();
        await sleep(2000);
        
        log('Aguardando modal de renovação...');
        await page.waitForSelector('.bootbox.modal.fade.show', { timeout: 10000 });
        
        log('Preenchendo quantidade de meses...');
        const monthsInput = await page.$('input#months');
        if (!monthsInput) {
            throw new Error('Campo de quantidade de meses não encontrado');
        }
        await monthsInput.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }, periodoMeses);
        await sleep(1000);
        
        log('Procurando botão confirmar...');
        const confirmBtn = await page.$('.bootbox.modal.fade.show button.btn-info.btnrenewplus');
        if (!confirmBtn) {
            throw new Error('Botão confirmar não encontrado');
        }
        await confirmBtn.click();
        await sleep(2000);
        
        log('Renovação confirmada!');
        
        // Manter navegador aberto para verificação
        log('Mantendo navegador aberto por 30 segundos para verificação...', 'info');
        await sleep(30000);
        
        console.log('');
        console.log(`🎉 RENOVAÇÃO DE ${periodoMeses} MÊS(ES) SERVIDOR 1 CONCLUÍDA!`);
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: ${periodoMeses} mês(es) (PLANO COMPLETO)`);
        
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
        console.log('🏁 PROCESSO FINALIZADO!');
    }
}

// Validação de argumentos
const args = process.argv.slice(2);

if (args.length === 0 || args.length % 2 !== 0) {
    console.log('❌ Erro: Argumentos inválidos');
    console.log('📖 Uso: node renovar-servidor1-1mes-correto.cjs <cliente_id> <periodo_meses> [<cliente_id2> <periodo_meses2> ...]');
    console.log('📖 Exemplo: node renovar-servidor1-1mes-correto.cjs 648718886 3 359503850 6');
    process.exit(1);
}

// Criar fila de tarefas
const queue = [];
for (let i = 0; i < args.length; i += 2) {
    const clienteId = args[i];
    const periodoMeses = args[i + 1];
    queue.push({ clienteId, periodoMeses });
}

console.log(`🎯 INICIANDO FILA DE RENOVAÇÕES - ${queue.length} cliente(s)`);
console.log('='.repeat(60));

// Processar fila sequencialmente
(async () => {
    for (let i = 0; i < queue.length; i++) {
        const task = queue[i];
        console.log(`\n🔄 PROCESSANDO ${i + 1}/${queue.length}: Cliente ${task.clienteId} - ${task.periodoMeses} mês(es)`);
        try {
            await renovarServidor1(task.clienteId, task.periodoMeses);
            console.log(`✅ Cliente ${task.clienteId} processado com sucesso!`);
        } catch (error) {
            console.log(`❌ Erro ao processar cliente ${task.clienteId}: ${error.message}`);
        }
        // Pequena pausa entre renovações para evitar sobrecarga
        if (i < queue.length - 1) {
            console.log('⏳ Aguardando 5 segundos antes da próxima renovação...');
            await sleep(5000);
        }
    }
    console.log('\n🎉 TODAS AS RENOVAÇÕES DA FILA FORAM PROCESSADAS!');
})();
