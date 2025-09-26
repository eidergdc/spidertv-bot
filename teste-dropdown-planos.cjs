/**
 * Teste Dropdown de Planos - Servidor 2 (SpiderTV)
 * 
 * Captura o dropdown de seleção de planos e suas opções
 * para identificarmos como selecionar diferentes períodos
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

async function capturarDropdownPlanos(clienteId) {
    console.log('📋 TESTE DROPDOWN DE PLANOS - SERVIDOR 2');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Objetivo: Capturar dropdown e opções de planos`);
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
        
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
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
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[type="search"]');
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
            
            // CAPTURAR TODOS OS DROPDOWNS E SELECTS
            log('Capturando dropdowns e selects...', 'capture');
            
            const dropdowns = await page.evaluate(() => {
                const results = [];
                
                // Procurar por selects
                const selects = document.querySelectorAll('select');
                selects.forEach((select, index) => {
                    const options = Array.from(select.options).map(option => ({
                        text: option.textContent?.trim() || '',
                        value: option.value,
                        selected: option.selected
                    }));
                    
                    results.push({
                        type: 'SELECT',
                        index: index,
                        id: select.id,
                        className: select.className,
                        name: select.name,
                        options: options,
                        selectedValue: select.value,
                        outerHTML: select.outerHTML.substring(0, 300) + '...'
                    });
                });
                
                // Procurar por dropdowns do Bootstrap/Element UI
                const dropdownBtns = document.querySelectorAll('.dropdown-toggle, .el-select, .el-dropdown');
                dropdownBtns.forEach((dropdown, index) => {
                    results.push({
                        type: 'DROPDOWN',
                        index: index,
                        id: dropdown.id,
                        className: dropdown.className,
                        text: dropdown.textContent?.trim() || '',
                        outerHTML: dropdown.outerHTML.substring(0, 300) + '...'
                    });
                });
                
                // Procurar por elementos que podem ser opções de plano
                const planElements = document.querySelectorAll('[data-plan], [data-period], .plan-option, .period-option');
                planElements.forEach((el, index) => {
                    const dataAttrs = {};
                    for (let attr of el.attributes) {
                        if (attr.name.startsWith('data-')) {
                            dataAttrs[attr.name] = attr.value;
                        }
                    }
                    
                    results.push({
                        type: 'PLAN_ELEMENT',
                        index: index,
                        tagName: el.tagName,
                        id: el.id,
                        className: el.className,
                        text: el.textContent?.trim() || '',
                        dataAttributes: dataAttrs,
                        outerHTML: el.outerHTML.substring(0, 300) + '...'
                    });
                });
                
                return results;
            });
            
            // Capturar também elementos com números (1, 3, 6, 12)
            const elementosComNumeros = await page.evaluate(() => {
                const results = [];
                const numeros = ['1', '3', '6', '12'];
                
                numeros.forEach(num => {
                    const elementos = Array.from(document.querySelectorAll('*')).filter(el => {
                        const text = el.textContent?.trim() || '';
                        const value = el.value || '';
                        return (text === num || value === num || 
                               text.includes(`${num} mês`) || text.includes(`${num} month`) ||
                               value.includes(`${num} mês`) || value.includes(`${num} month`)) &&
                               el.offsetParent !== null; // Apenas elementos visíveis
                    });
                    
                    elementos.slice(0, 5).forEach(el => { // Limitar a 5 por número
                        const dataAttrs = {};
                        for (let attr of el.attributes) {
                            if (attr.name.startsWith('data-')) {
                                dataAttrs[attr.name] = attr.value;
                            }
                        }
                        
                        results.push({
                            numero: num,
                            tagName: el.tagName,
                            id: el.id,
                            className: el.className,
                            text: el.textContent?.trim() || '',
                            value: el.value || '',
                            type: el.type || '',
                            dataAttributes: dataAttrs,
                            outerHTML: el.outerHTML.substring(0, 200) + '...'
                        });
                    });
                });
                
                return results;
            });
            
            // Exibir resultados
            console.log('');
            console.log('📸 === DROPDOWNS E SELECTS CAPTURADOS ===');
            
            if (dropdowns.length > 0) {
                dropdowns.forEach((dropdown, i) => {
                    console.log(`\n${i + 1}. ${dropdown.type} - ${dropdown.className}`);
                    console.log(`   ID: ${dropdown.id}`);
                    console.log(`   Nome: ${dropdown.name || 'N/A'}`);
                    
                    if (dropdown.options) {
                        console.log(`   Opções (${dropdown.options.length}):`);
                        dropdown.options.forEach((option, j) => {
                            const selected = option.selected ? ' [SELECIONADO]' : '';
                            console.log(`     ${j + 1}. "${option.text}" (valor: "${option.value}")${selected}`);
                        });
                        console.log(`   Valor atual: ${dropdown.selectedValue}`);
                    }
                    
                    console.log(`   HTML: ${dropdown.outerHTML}`);
                });
            } else {
                console.log('❌ Nenhum dropdown/select encontrado');
            }
            
            console.log('\n🔢 === ELEMENTOS COM NÚMEROS (1, 3, 6, 12) ===');
            if (elementosComNumeros.length > 0) {
                elementosComNumeros.forEach((el, i) => {
                    console.log(`\n${i + 1}. [${el.numero}] ${el.tagName}`);
                    console.log(`   Classe: ${el.className}`);
                    console.log(`   ID: ${el.id}`);
                    console.log(`   Texto: "${el.text}"`);
                    console.log(`   Valor: "${el.value}"`);
                    console.log(`   Tipo: ${el.type}`);
                    if (Object.keys(el.dataAttributes).length > 0) {
                        console.log(`   Data Attributes:`, el.dataAttributes);
                    }
                    console.log(`   HTML: ${el.outerHTML}`);
                });
            } else {
                console.log('❌ Nenhum elemento com números encontrado');
            }
            
            console.log('\n💾 Captura de dropdown completa!');
            console.log('⏳ Mantendo navegador aberto por 45 segundos para análise...');
            
            await sleep(45000);
            
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
        
        console.log('\n🏁 CAPTURA DE DROPDOWN FINALIZADA!');
    }
}

// Validação de argumentos
const clienteId = process.argv[2];

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node teste-dropdown-planos.cjs <cliente_id>');
    console.log('📖 Exemplo: node teste-dropdown-planos.cjs 359503850');
    process.exit(1);
}

// Executar teste
capturarDropdownPlanos(clienteId).catch(console.error);
