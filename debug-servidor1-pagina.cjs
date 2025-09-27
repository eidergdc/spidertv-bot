/**
 * Debug Servidor 1 - Capturar estrutura da página
 * Para entender os seletores corretos
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
    
    console.log(`[${timestamp}] 🔍 DEBUG ${prefix} ${mensagem}`);
}

async function debugPagina() {
    console.log('🔍 DEBUG - ESTRUTURA DA PÁGINA SERVIDOR 1');
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
        
        // 1. Acessar página de login
        log('Acessando página de login...');
        await page.goto('https://painel.tropicalplaytv.com/', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(2000);
        
        // 2. Fazer login
        log('Fazendo login...');
        const userField = await page.$('input[name="username"]');
        const passField = await page.$('input[name="password"]');
        
        if (userField && passField) {
            await userField.click();
            await userField.type('Eider Goncalves', { delay: 100 });
            await sleep(500);
            
            await passField.click();
            await passField.type('Goncalves1', { delay: 100 });
            await sleep(500);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(3000);
                log('Login realizado!', 'success');
            }
        }
        
        // 3. Navegar para página de clientes IPTV
        log('Navegando para página de clientes IPTV...');
        await page.goto('https://painel.tropicalplaytv.com/iptv/clients', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(5000);
        
        // 4. Capturar todos os inputs da página
        log('Capturando todos os inputs da página...');
        const inputs = await page.evaluate(() => {
            const allInputs = document.querySelectorAll('input');
            return Array.from(allInputs).map(input => ({
                type: input.type,
                name: input.name,
                id: input.id,
                className: input.className,
                placeholder: input.placeholder,
                ariaControls: input.getAttribute('aria-controls'),
                outerHTML: input.outerHTML.substring(0, 200)
            }));
        });
        
        console.log('\n📋 INPUTS ENCONTRADOS:');
        inputs.forEach((input, index) => {
            console.log(`\n${index + 1}. INPUT:`);
            console.log(`   Type: ${input.type}`);
            console.log(`   Name: ${input.name}`);
            console.log(`   ID: ${input.id}`);
            console.log(`   Class: ${input.className}`);
            console.log(`   Placeholder: ${input.placeholder}`);
            console.log(`   Aria-controls: ${input.ariaControls}`);
            console.log(`   HTML: ${input.outerHTML}`);
        });
        
        // 5. Capturar todos os elementos com ícone calendar
        log('Procurando elementos com ícone calendar...');
        const calendarElements = await page.evaluate(() => {
            const calendars = document.querySelectorAll('i[class*="calendar"], .fa-calendar, .fad.fa-calendar-alt');
            return Array.from(calendars).map(el => ({
                className: el.className,
                parentHTML: el.parentElement ? el.parentElement.outerHTML.substring(0, 200) : 'No parent',
                outerHTML: el.outerHTML
            }));
        });
        
        console.log('\n📅 ELEMENTOS CALENDAR ENCONTRADOS:');
        calendarElements.forEach((cal, index) => {
            console.log(`\n${index + 1}. CALENDAR:`);
            console.log(`   Class: ${cal.className}`);
            console.log(`   Parent: ${cal.parentHTML}`);
            console.log(`   HTML: ${cal.outerHTML}`);
        });
        
        // 6. Aguardar para inspeção manual
        log('Aguardando 30 segundos para inspeção manual...');
        await sleep(30000);
        
    } catch (error) {
        log(`Erro: ${error.message}`, 'error');
    } finally {
        if (browser) {
            log('Fechando navegador...');
            await browser.close();
            log('Navegador fechado');
        }
        
        console.log('\n🏁 DEBUG FINALIZADO!');
    }
}

// Executar debug
debugPagina().catch(console.error);
