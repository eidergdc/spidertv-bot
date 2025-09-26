/**
 * Capturar Clique Manual - Servidor 2 (SpiderTV)
 * 
 * Abre o dropdown e captura as coordenadas exatas do clique manual
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

async function capturarCliqueManual(clienteId) {
    console.log('📸 CAPTURAR CLIQUE MANUAL - SERVIDOR 2');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`👤 Você vai clicar na opção de 6 meses`);
    console.log('='.repeat(60));
    
    let browser;
    let page;
    let coordenadasCapturadas = [];
    
    try {
        // Lançar navegador
        log('Lançando navegador...', 'manual');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            devtools: false, // Sem DevTools para não atrapalhar
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
        
        // Adicionar listener para capturar TODOS os cliques
        await page.evaluateOnNewDocument(() => {
            window.allClicks = [];
            document.addEventListener('click', (event) => {
                const coords = {
                    x: event.clientX,
                    y: event.clientY,
                    target: event.target.tagName,
                    text: event.target.textContent?.trim() || '',
                    className: event.target.className,
                    id: event.target.id,
                    timestamp: Date.now()
                };
                window.allClicks.push(coords);
                console.log(`🎯 Clique: (${coords.x}, ${coords.y}) - "${coords.text}"`);
            });
        });
        
        // Login rápido
        log('Fazendo login...', 'manual');
        await page.goto('https://spidertv.sigma.st/#/sign-in', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(2000);
        
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            await userField.click();
            await userField.type('tropicalplay', { delay: 50 });
            await sleep(200);
            
            await passField.click();
            await passField.type('Virginia13', { delay: 50 });
            await sleep(200);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(4000);
                log('Login realizado!', 'success');
            }
        }
        
        // Navegar para clientes
        log('Navegando para página de clientes...', 'manual');
        await page.goto('https://spidertv.sigma.st/#/customers', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(3000);
        
        // Buscar cliente
        log(`Buscando cliente ${clienteId}...`, 'manual');
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[type="search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId, { delay: 50 });
            await page.keyboard.press('Enter');
            await sleep(4000);
        }
        
        // Procurar cliente na tabela
        log('Procurando cliente na tabela...', 'manual');
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
                log('Usando primeira linha da tabela', 'warning');
            }
        }
        
        // Procurar e clicar no botão de renovação
        log('Procurando botão de renovação...', 'manual');
        let renewBtn = await page.$('button.btn.btn-icon.btn-bg-light.btn-warning.btn-sm');
        if (!renewBtn) {
            const iconBtn = await page.$('i.fa-calendar-plus');
            if (iconBtn) {
                renewBtn = await page.evaluateHandle(icon => icon.closest('button'), iconBtn);
            }
        }
        
        if (renewBtn) {
            log('Clicando no botão de renovação...', 'manual');
            await renewBtn.click();
            await sleep(4000);
            
            // Abrir dropdown automaticamente
            log('Procurando e abrindo dropdown...', 'manual');
            const packageDropdown = await page.$('[data-test="package_id"]');
            if (packageDropdown) {
                log('Dropdown encontrado! Abrindo...', 'success');
                
                try {
                    await packageDropdown.click();
                    log('✅ Dropdown aberto!', 'success');
                } catch (error) {
                    log('Clique normal falhou, tentando JavaScript...', 'warning');
                    await page.evaluate(el => el.click(), packageDropdown);
                    log('✅ Dropdown aberto com JavaScript!', 'success');
                }
                
                await sleep(3000);
                
                // Aguardar opções carregarem
                try {
                    await page.waitForSelector('.el-select-dropdown__item', { timeout: 8000 });
                    log('✅ Opções do dropdown carregadas!', 'success');
                } catch (error) {
                    log('Timeout aguardando opções, mas continuando...', 'warning');
                }
                
                console.log('\n🎯 DROPDOWN ABERTO - PRONTO PARA CLIQUE MANUAL!');
                console.log('👤 INSTRUÇÕES:');
                console.log('1. O dropdown está aberto');
                console.log('2. Clique na opção de 6 meses (PLANO COMPLETO - SEMESTRAL)');
                console.log('3. As coordenadas serão capturadas automaticamente');
                console.log('4. Aguardando por 60 segundos...');
                console.log('');
                
                // Limpar cliques anteriores
                await page.evaluate(() => {
                    window.allClicks = [];
                });
                
                // Aguardar clique manual
                log('👤 AGUARDANDO SEU CLIQUE na opção de 6 meses...', 'manual');
                await sleep(60000);
                
                // Capturar todos os cliques
                coordenadasCapturadas = await page.evaluate(() => {
                    return window.allClicks || [];
                });
                
                console.log('\n📸 COORDENADAS CAPTURADAS:');
                if (coordenadasCapturadas.length > 0) {
                    coordenadasCapturadas.forEach((coord, i) => {
                        console.log(`\n${i + 1}. Clique em (${coord.x}, ${coord.y})`);
                        console.log(`   Elemento: ${coord.target}`);
                        console.log(`   Texto: "${coord.text}"`);
                        console.log(`   Classe: ${coord.className}`);
                        
                        // Destacar cliques que podem ser a opção de 6 meses
                        if (coord.text.includes('SEMESTRAL') || 
                            coord.text.includes('6') || 
                            coord.className.includes('dropdown') ||
                            coord.className.includes('option')) {
                            console.log(`   🎯 POSSÍVEL OPÇÃO DE 6 MESES!`);
                        }
                    });
                    
                    // Pegar o último clique (provavelmente o mais relevante)
                    const ultimoClique = coordenadasCapturadas[coordenadasCapturadas.length - 1];
                    console.log(`\n✅ COORDENADA PARA USAR NO SCRIPT:`);
                    console.log(`await page.mouse.click(${ultimoClique.x}, ${ultimoClique.y});`);
                    console.log(`// Texto clicado: "${ultimoClique.text}"`);
                    
                } else {
                    console.log('❌ Nenhum clique foi capturado');
                }
                
            } else {
                log('❌ Dropdown não encontrado', 'error');
            }
            
            // Manter navegador aberto para análise
            log('Mantendo navegador aberto por mais 30 segundos...', 'manual');
            await sleep(30000);
            
        } else {
            throw new Error('Botão de renovação não encontrado');
        }
        
    } catch (error) {
        log(`Erro: ${error.message}`, 'error');
    } finally {
        if (browser) {
            log('Fechando navegador...', 'manual');
            await browser.close();
            log('Navegador fechado');
        }
        
        console.log('\n🏁 CAPTURA FINALIZADA!');
        
        // Mostrar resumo das coordenadas
        if (coordenadasCapturadas.length > 0) {
            console.log('\n📋 RESUMO DAS COORDENADAS:');
            coordenadasCapturadas.forEach((coord, i) => {
                console.log(`${i + 1}. (${coord.x}, ${coord.y}) - "${coord.text}"`);
            });
        }
    }
}

// Validação de argumentos
const clienteId = process.argv[2] || '359503850';

// Executar captura
capturarCliqueManual(clienteId).catch(console.error);
