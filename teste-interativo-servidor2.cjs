/**
 * Teste Interativo - Servidor 2 (SpiderTV)
 * 
 * Este teste permite interação manual para identificar seletores corretos
 * O usuário pode selecionar manualmente o plano de 3 meses
 * O script vai capturar e registrar os seletores utilizados
 * 
 * Uso: node teste-interativo-servidor2.cjs <cliente_id>
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
        case 'manual': prefix = '👤'; break;
        case 'capture': prefix = '📸'; break;
        default: prefix = '📝'; break;
    }
    
    console.log(`[${timestamp}] 🕷️ SpiderTV ${prefix} ${mensagem}`);
}

async function testeInterativo(clienteId) {
    console.log('🧪 TESTE INTERATIVO - SERVIDOR 2 (SPIDERTV)');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Objetivo: Identificar seletores do plano de 3 meses`);
    console.log('👤 Modo: INTERATIVO (você vai selecionar manualmente)');
    console.log('='.repeat(60));
    
    let browser;
    let page;
    
    try {
        // Lançar navegador
        log('Lançando navegador em modo interativo...');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 200,
            devtools: true, // Abrir DevTools para debug
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=VizDisplayCompositor',
                '--start-maximized'
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
        await page.goto('https://spidertv.sigma.st/#/sign-in', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(2000);
        
        log('Preenchendo credenciais...');
        const userField = await page.$('input[type="text"], input[type="email"], input[name="username"]');
        const passField = await page.$('input[type="password"], input[name="password"]');
        
        if (userField && passField) {
            await userField.click();
            await userField.type('tropicalplay', { delay: 100 });
            await sleep(500);
            
            await passField.click();
            await passField.type('Virginia13', { delay: 100 });
            await sleep(500);
            
            log('Clicando no botão de login...');
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
            log('Busca realizada!');
        }
        
        // Procurar cliente na tabela
        log('Procurando cliente na tabela...');
        const cells = await page.$$('td');
        let clienteFound = false;
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                log(`Cliente encontrado na célula: ${text}`, 'success');
                const row = await page.evaluateHandle(cell => cell.closest('tr'), cell);
                await row.click();
                await sleep(3000);
                clienteFound = true;
                break;
            }
        }
        
        if (!clienteFound) {
            log('Cliente não encontrado na tabela, clicando na primeira linha...', 'warning');
            const firstRow = await page.$('tbody tr:first-child');
            if (firstRow) {
                await firstRow.click();
                await sleep(3000);
                log('Primeira linha clicada!');
            }
        }
        
        // Procurar botão de renovação
        log('Procurando botão de renovação...');
        await sleep(2000);
        
        let renewBtn = await page.$('button.btn.btn-icon.btn-bg-light.btn-warning.btn-sm');
        if (renewBtn) {
            log('Botão de renovação encontrado pelo seletor exato!', 'success');
        } else {
            const iconBtn = await page.$('i.fa-calendar-plus');
            if (iconBtn) {
                renewBtn = await page.evaluateHandle(icon => icon.closest('button'), iconBtn);
                log('Botão de renovação encontrado pelo ícone!', 'success');
            }
        }
        
        if (renewBtn) {
            log('Clicando no botão de renovação...');
            try {
                await renewBtn.click();
            } catch (error) {
                log('Clique normal falhou, tentando JavaScript...', 'warning');
                await page.evaluate(btn => btn.click(), renewBtn);
            }
            await sleep(3000);
            
            // MODO INTERATIVO - Aguardar seleção manual
            console.log('');
            console.log('🎯 === MODO INTERATIVO ATIVADO ===');
            console.log('👤 INSTRUÇÕES:');
            console.log('1. Agora você deve MANUALMENTE selecionar o plano de 3 meses');
            console.log('2. Clique no plano de 3 meses na interface');
            console.log('3. NÃO confirme ainda - apenas selecione o plano');
            console.log('4. Pressione ENTER neste terminal quando tiver selecionado');
            console.log('');
            console.log('⏳ Aguardando sua seleção manual...');
            
            // Aguardar input do usuário
            await new Promise(resolve => {
                process.stdin.once('data', () => {
                    resolve();
                });
            });
            
            log('Capturando elementos selecionados...', 'capture');
            
            // Capturar todos os elementos que podem estar selecionados
            const selectedElements = await page.evaluate(() => {
                const results = [];
                
                // Procurar elementos com classes que indicam seleção
                const selectors = [
                    '.selected',
                    '.active',
                    '.checked',
                    '[aria-selected="true"]',
                    '[data-selected="true"]',
                    '.btn-primary',
                    '.btn-success',
                    '.highlighted',
                    'input[type="radio"]:checked',
                    'input[type="checkbox"]:checked',
                    '.plan-selected',
                    '.option-selected'
                ];
                
                selectors.forEach(selector => {
                    try {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach((el, index) => {
                            const text = el.textContent?.trim() || '';
                            const value = el.value || '';
                            const dataAttrs = {};
                            
                            // Capturar todos os data-* attributes
                            for (let attr of el.attributes) {
                                if (attr.name.startsWith('data-')) {
                                    dataAttrs[attr.name] = attr.value;
                                }
                            }
                            
                            if (text.includes('3') || text.includes('mês') || text.includes('month') || 
                                value.includes('3') || Object.values(dataAttrs).some(v => v.includes('3'))) {
                                results.push({
                                    selector: selector,
                                    index: index,
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
                    } catch (e) {
                        // Ignorar erros de seletor
                    }
                });
                
                return results;
            });
            
            // Capturar elementos que contêm "3 mês" ou similar
            const planElements = await page.evaluate(() => {
                const results = [];
                const allElements = document.querySelectorAll('*');
                
                allElements.forEach(el => {
                    const text = el.textContent?.trim() || '';
                    const value = el.value || '';
                    
                    if ((text.includes('3') && (text.includes('mês') || text.includes('month'))) ||
                        (value.includes('3') && (value.includes('mês') || value.includes('month'))) ||
                        text.includes('bOxLAQLZ7a') || value.includes('bOxLAQLZ7a')) {
                        
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
                            outerHTML: el.outerHTML.substring(0, 300) + '...'
                        });
                    }
                });
                
                return results.slice(0, 10); // Limitar a 10 resultados
            });
            
            // Exibir resultados
            console.log('');
            console.log('📸 === ELEMENTOS CAPTURADOS ===');
            
            if (selectedElements.length > 0) {
                console.log('🎯 ELEMENTOS SELECIONADOS:');
                selectedElements.forEach((el, i) => {
                    console.log(`\n${i + 1}. ${el.tagName} (${el.selector})`);
                    console.log(`   Classe: ${el.className}`);
                    console.log(`   ID: ${el.id}`);
                    console.log(`   Texto: ${el.text}`);
                    console.log(`   Valor: ${el.value}`);
                    console.log(`   Data Attributes:`, el.dataAttributes);
                    console.log(`   HTML: ${el.outerHTML}`);
                });
            }
            
            if (planElements.length > 0) {
                console.log('\n📋 ELEMENTOS DE PLANO ENCONTRADOS:');
                planElements.forEach((el, i) => {
                    console.log(`\n${i + 1}. ${el.tagName}`);
                    console.log(`   Classe: ${el.className}`);
                    console.log(`   ID: ${el.id}`);
                    console.log(`   Texto: ${el.text}`);
                    console.log(`   Valor: ${el.value}`);
                    console.log(`   Data Attributes:`, el.dataAttributes);
                    console.log(`   HTML: ${el.outerHTML}`);
                });
            }
            
            console.log('');
            console.log('💾 Informações capturadas! Agora você pode confirmar a renovação manualmente se desejar.');
            console.log('⏳ Mantendo navegador aberto por 60 segundos para análise...');
            
            await sleep(60000);
            
        } else {
            throw new Error('Botão de renovação não encontrado');
        }
        
    } catch (error) {
        log(`Erro no teste: ${error.message}`, 'error');
        console.log('');
        console.log('❌ TESTE FALHOU');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`❌ Erro: ${error.message}`);
    } finally {
        if (browser) {
            log('Fechando navegador...');
            await browser.close();
            log('Navegador fechado');
        }
        
        console.log('');
        console.log('🏁 TESTE INTERATIVO FINALIZADO!');
    }
}

// Validação de argumentos
const clienteId = process.argv[2];

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node teste-interativo-servidor2.cjs <cliente_id>');
    console.log('📖 Exemplo: node teste-interativo-servidor2.cjs 359503850');
    process.exit(1);
}

// Executar teste
testeInterativo(clienteId).catch(console.error);
