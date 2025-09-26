/**
 * Teste de Captura de Planos - Servidor 2 (SpiderTV)
 * 
 * Este teste captura TODOS os elementos relacionados a planos na tela
 * para identificarmos os seletores corretos
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
        case 'capture': prefix = '📸'; break;
        default: prefix = '📝'; break;
    }
    
    console.log(`[${timestamp}] 🕷️ SpiderTV ${prefix} ${mensagem}`);
}

async function capturarPlanos(clienteId) {
    console.log('🔍 TESTE DE CAPTURA DE PLANOS - SERVIDOR 2');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Objetivo: Capturar TODOS os elementos de planos`);
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
                '--disable-blink-features=AutomationControlled',
                '--start-maximized'
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
        
        const userField = await page.$('input[type="text"], input[type="email"], input[name="username"]');
        const passField = await page.$('input[type="password"], input[name="password"]');
        
        if (userField && passField) {
            await userField.click();
            await userField.type('tropicalplay', { delay: 100 });
            await sleep(500);
            
            await passField.click();
            await passField.type('Virginia13', { delay: 100 });
            await sleep(500);
            
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
            await searchField.type(clienteId, { delay: 100 });
            await page.keyboard.press('Enter');
            await sleep(4000);
        }
        
        // Procurar cliente na tabela
        log('Procurando cliente na tabela...');
        const cells = await page.$$('td');
        let clienteFound = false;
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                log(`Cliente encontrado: ${text}`, 'success');
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
            }
        }
        
        // Procurar e clicar no botão de renovação
        log('Procurando botão de renovação...');
        let renewBtn = await page.$('button.btn.btn-icon.btn-bg-light.btn-warning.btn-sm');
        if (renewBtn) {
            log('Botão de renovação encontrado!', 'success');
            await renewBtn.click();
            await sleep(3000);
            
            // CAPTURAR TODOS OS ELEMENTOS RELACIONADOS A PLANOS
            log('Capturando TODOS os elementos de planos...', 'capture');
            
            const todosElementos = await page.evaluate(() => {
                const results = [];
                
                // Procurar por TODOS os elementos que podem ser planos
                const allElements = document.querySelectorAll('*');
                
                allElements.forEach((el, index) => {
                    const text = el.textContent?.trim() || '';
                    const value = el.value || '';
                    const className = String(el.className || '');
                    const id = String(el.id || '');
                    
                    // Critérios para identificar elementos de plano
                    const isPlanElement = 
                        text.includes('mês') || text.includes('month') ||
                        text.includes('plano') || text.includes('plan') ||
                        text.includes('trimestral') || text.includes('quarterly') ||
                        text.includes('bOxLAQLZ7a') ||
                        value.includes('bOxLAQLZ7a') ||
                        className.includes('plan') ||
                        className.includes('option') ||
                        className.includes('btn') ||
                        id.includes('plan') ||
                        (text.match(/\d+/) && (text.includes('mês') || text.includes('month'))) ||
                        el.tagName === 'OPTION' ||
                        el.tagName === 'BUTTON' ||
                        (el.tagName === 'INPUT' && (el.type === 'radio' || el.type === 'checkbox'));
                    
                    if (isPlanElement && text.length > 0) {
                        // Capturar todos os data-* attributes
                        const dataAttrs = {};
                        for (let attr of el.attributes) {
                            if (attr.name.startsWith('data-')) {
                                dataAttrs[attr.name] = attr.value;
                            }
                        }
                        
                        results.push({
                            index: index,
                            tagName: el.tagName,
                            className: className,
                            id: id,
                            text: text.substring(0, 100),
                            value: value,
                            type: el.type || '',
                            checked: el.checked || false,
                            selected: el.selected || false,
                            dataAttributes: dataAttrs,
                            outerHTML: el.outerHTML.substring(0, 300) + '...',
                            isVisible: el.offsetParent !== null,
                            computedStyle: {
                                display: window.getComputedStyle(el).display,
                                visibility: window.getComputedStyle(el).visibility
                            }
                        });
                    }
                });
                
                return results.slice(0, 50); // Limitar a 50 resultados
            });
            
            // Capturar especificamente elementos com "3"
            const elementosCom3 = await page.evaluate(() => {
                const results = [];
                const allElements = document.querySelectorAll('*');
                
                allElements.forEach(el => {
                    const text = el.textContent?.trim() || '';
                    const value = el.value || '';
                    
                    if ((text.includes('3') || value.includes('3')) && 
                        (text.length < 50) && // Evitar textos muito longos
                        el.offsetParent !== null) { // Apenas elementos visíveis
                        
                        const dataAttrs = {};
                        for (let attr of el.attributes) {
                            if (attr.name.startsWith('data-')) {
                                dataAttrs[attr.name] = attr.value;
                            }
                        }
                        
                        results.push({
                            tagName: el.tagName,
                            className: el.className,
                            id: el.id,
                            text: text,
                            value: value,
                            dataAttributes: dataAttrs,
                            outerHTML: el.outerHTML.substring(0, 200) + '...'
                        });
                    }
                });
                
                return results.slice(0, 20);
            });
            
            // Exibir resultados
            console.log('');
            console.log('📸 === TODOS OS ELEMENTOS DE PLANOS CAPTURADOS ===');
            
            if (todosElementos.length > 0) {
                console.log(`\n🎯 ENCONTRADOS ${todosElementos.length} ELEMENTOS DE PLANOS:`);
                todosElementos.forEach((el, i) => {
                    console.log(`\n${i + 1}. ${el.tagName} ${el.type ? `(${el.type})` : ''}`);
                    console.log(`   Classe: ${el.className}`);
                    console.log(`   ID: ${el.id}`);
                    console.log(`   Texto: "${el.text}"`);
                    console.log(`   Valor: "${el.value}"`);
                    console.log(`   Visível: ${el.isVisible}`);
                    console.log(`   Selecionado: ${el.checked || el.selected}`);
                    if (Object.keys(el.dataAttributes).length > 0) {
                        console.log(`   Data Attributes:`, el.dataAttributes);
                    }
                    console.log(`   HTML: ${el.outerHTML}`);
                });
            }
            
            if (elementosCom3.length > 0) {
                console.log(`\n🔢 ELEMENTOS COM "3" (${elementosCom3.length} encontrados):`);
                elementosCom3.forEach((el, i) => {
                    console.log(`\n${i + 1}. ${el.tagName}`);
                    console.log(`   Classe: ${el.className}`);
                    console.log(`   ID: ${el.id}`);
                    console.log(`   Texto: "${el.text}"`);
                    console.log(`   Valor: "${el.value}"`);
                    if (Object.keys(el.dataAttributes).length > 0) {
                        console.log(`   Data Attributes:`, el.dataAttributes);
                    }
                    console.log(`   HTML: ${el.outerHTML}`);
                });
            }
            
            console.log('\n💾 Captura completa realizada!');
            console.log('⏳ Mantendo navegador aberto por 30 segundos para análise manual...');
            
            await sleep(30000);
            
        } else {
            throw new Error('Botão de renovação não encontrado');
        }
        
    } catch (error) {
        log(`Erro: ${error.message}`, 'error');
    } finally {
        if (browser) {
            log('Fechando navegador...');
            await browser.close();
            log('Navegador fechado');
        }
        
        console.log('\n🏁 CAPTURA DE PLANOS FINALIZADA!');
    }
}

// Validação de argumentos
const clienteId = process.argv[2];

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node teste-captura-planos.cjs <cliente_id>');
    console.log('📖 Exemplo: node teste-captura-planos.cjs 359503850');
    process.exit(1);
}

// Executar teste
capturarPlanos(clienteId).catch(console.error);
