/**
 * Teste Servidor 1 - Login e Navegação
 * 
 * Testa o login no TropicalPlayTV para identificar os seletores corretos
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
    
    console.log(`[${timestamp}] 🌴 TropicalPlayTV ${prefix} ${mensagem}`);
}

async function testeServidor1() {
    console.log('🧪 TESTE SERVIDOR 1 - LOGIN E NAVEGAÇÃO');
    console.log('🎯 URL: https://painel.tropicalplaytv.com/');
    console.log('='.repeat(60));
    
    let browser;
    let page;
    
    try {
        // Lançar navegador
        log('Lançando navegador...');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 200,
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
        
        // Navegar para a página
        log('Navegando para https://painel.tropicalplaytv.com/...');
        await page.goto('https://painel.tropicalplaytv.com/', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(3000);
        
        // Analisar a página
        log('Analisando elementos da página...');
        
        // Procurar campos de login
        const loginElements = await page.evaluate(() => {
            const elements = {
                userFields: [],
                passFields: [],
                buttons: [],
                forms: []
            };
            
            // Campos de usuário
            const userSelectors = [
                'input[name="username"]',
                'input[name="user"]', 
                'input[name="email"]',
                'input[type="text"]',
                'input[type="email"]',
                '#username',
                '#user',
                '#email'
            ];
            
            userSelectors.forEach(selector => {
                const el = document.querySelector(selector);
                if (el) {
                    elements.userFields.push({
                        selector,
                        id: el.id,
                        name: el.name,
                        type: el.type,
                        placeholder: el.placeholder
                    });
                }
            });
            
            // Campos de senha
            const passSelectors = [
                'input[name="password"]',
                'input[name="pass"]',
                'input[type="password"]',
                '#password',
                '#pass'
            ];
            
            passSelectors.forEach(selector => {
                const el = document.querySelector(selector);
                if (el) {
                    elements.passFields.push({
                        selector,
                        id: el.id,
                        name: el.name,
                        type: el.type,
                        placeholder: el.placeholder
                    });
                }
            });
            
            // Botões
            const buttonSelectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button',
                '.btn',
                '#button-login',
                '#login-button'
            ];
            
            buttonSelectors.forEach(selector => {
                const el = document.querySelector(selector);
                if (el) {
                    elements.buttons.push({
                        selector,
                        id: el.id,
                        className: el.className,
                        text: el.textContent?.trim() || el.value,
                        type: el.type
                    });
                }
            });
            
            // Formulários
            const forms = document.querySelectorAll('form');
            forms.forEach((form, index) => {
                elements.forms.push({
                    index,
                    id: form.id,
                    className: form.className,
                    action: form.action,
                    method: form.method
                });
            });
            
            return elements;
        });
        
        console.log('\n📋 ELEMENTOS ENCONTRADOS:');
        
        console.log('\n👤 Campos de Usuário:');
        loginElements.userFields.forEach((field, i) => {
            console.log(`  ${i + 1}. ${field.selector}`);
            console.log(`     ID: ${field.id}, Name: ${field.name}, Type: ${field.type}`);
            console.log(`     Placeholder: ${field.placeholder}`);
        });
        
        console.log('\n🔒 Campos de Senha:');
        loginElements.passFields.forEach((field, i) => {
            console.log(`  ${i + 1}. ${field.selector}`);
            console.log(`     ID: ${field.id}, Name: ${field.name}, Type: ${field.type}`);
            console.log(`     Placeholder: ${field.placeholder}`);
        });
        
        console.log('\n🔘 Botões:');
        loginElements.buttons.forEach((btn, i) => {
            console.log(`  ${i + 1}. ${btn.selector}`);
            console.log(`     ID: ${btn.id}, Class: ${btn.className}`);
            console.log(`     Text: "${btn.text}", Type: ${btn.type}`);
        });
        
        console.log('\n📝 Formulários:');
        loginElements.forms.forEach((form, i) => {
            console.log(`  ${i + 1}. Form ${form.index}`);
            console.log(`     ID: ${form.id}, Class: ${form.className}`);
            console.log(`     Action: ${form.action}, Method: ${form.method}`);
        });
        
        // Manter navegador aberto para inspeção manual
        log('Mantendo navegador aberto por 60 segundos para inspeção manual...', 'info');
        await sleep(60000);
        
    } catch (error) {
        log(`Erro: ${error.message}`, 'error');
    } finally {
        if (browser) {
            log('Fechando navegador...');
            await browser.close();
            log('Navegador fechado');
        }
        
        console.log('\n🏁 TESTE FINALIZADO!');
    }
}

// Executar teste
testeServidor1().catch(console.error);
