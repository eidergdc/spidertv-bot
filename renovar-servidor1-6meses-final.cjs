/**
 * Renovação Servidor 1 - 6 Meses CORRETO
 * 
 * TropicalPlayTV - Renovação via automação web
 * Fluxo completo baseado nas instruções fornecidas
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

async function renovar6MesesServidor1(clienteId) {
    console.log('🎯 RENOVAÇÃO SERVIDOR 1 - 6 MESES CORRETO');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: 6 meses`);
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
        
        // Configurações anti-detecção
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 720 });
        
        // 1. FAZER LOGIN
        log('Navegando para página de login...');
        await page.goto('https://painel.tropicalplaytv.com/', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(3000);
        
        log('Fazendo login...');
        const userField = await page.$('#username');
        const passField = await page.$('#password');
        
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
                await loginBtn.click();
                await sleep(2000);
                log('Login realizado!', 'success');
            }
        } else {
            throw new Error('Campos de login não encontrados');
        }
        
        // 2. NAVEGAR PARA PÁGINA DE CLIENTES
        log('Navegando para página de clientes...');
        await page.goto('https://painel.tropicalplaytv.com/iptv/clients', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(3000);
        
        // 3. BUSCAR CLIENTE
        log(`Buscando cliente ${clienteId}...`);
        const searchField = await page.$('input[type="search"].form-control.form-control-sm');
        if (searchField) {
            await searchField.click();
            await searchField.evaluate((el, text) => {
                el.value = text;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }, clienteId);
            await page.keyboard.press('Enter');
            await sleep(2000);
            log('Busca realizada!', 'success');
        } else {
            throw new Error('Campo de busca não encontrado');
        }
        
        // 4. CLICAR NO BOTÃO CALENDAR
        log('Procurando botão de renovação (calendar)...');
        const calendarIcon = await page.$('i.fad.fa-calendar-alt');
        
        if (calendarIcon) {
            log('Ícone de calendar encontrado!', 'success');
            await calendarIcon.click();
            await sleep(3000);
            
            // 5. AGUARDAR MODAL APARECER
            log('Aguardando modal de renovação...');
            await page.waitForSelector('.bootbox.modal.fade.show', { timeout: 10000 });
            log('Modal de renovação aberto!', 'success');
            
            // 6. INSERIR QUANTIDADE DE MESES
            log('Inserindo quantidade de meses (6)...');
            const monthsField = await page.$('#months');
            if (monthsField) {
                // Limpar campo e inserir 6
                await monthsField.click({ clickCount: 3 });
                await monthsField.evaluate((el, text) => {
                el.value = text;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }, '6');
                await sleep(1000);
                log('6 meses inserido no campo!', 'success');
            } else {
                throw new Error('Campo de meses não encontrado');
            }
            
            // 7. CLICAR NO BOTÃO CONFIRMAR
            log('Procurando botão Confirmar...');
            const confirmBtn = await page.$('.btn.btn-info.btnrenewplus');
            if (confirmBtn) {
                log('Clicando no botão Confirmar...');
                await confirmBtn.click();
                await sleep(2000);
                log('Renovação confirmada!', 'success');
            } else {
                throw new Error('Botão Confirmar não encontrado');
            }
            
        } else {
            throw new Error('Ícone de calendar não encontrado');
        }
        
        // Manter navegador aberto para verificação
        log('Mantendo navegador aberto por 30 segundos para verificação...', 'info');
        await sleep(30000);
        
        console.log('');
        console.log('🎉 RENOVAÇÃO DE 6 MESES SERVIDOR 1 CONCLUÍDA!');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: 6 meses`);
        
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
const clienteId = process.argv[2];

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node renovar-servidor1-6meses-final.cjs <cliente_id>');
    console.log('📖 Exemplo: node renovar-servidor1-6meses-final.cjs 648718886');
    process.exit(1);
}

// Executar renovação
renovar6MesesServidor1(clienteId).catch(console.error);
