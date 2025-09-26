/**
 * Capturar Coordenadas do Dropdown - Servidor 2 (SpiderTV)
 * 
 * Script interativo que permite clicar manualmente na opção correta
 * e captura as coordenadas para automação
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

async function capturarCoordenadas(clienteId) {
    console.log('📸 CAPTURAR COORDENADAS DO DROPDOWN - SERVIDOR 2');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`👤 Modo: INTERATIVO - Você vai clicar na opção correta`);
    console.log('='.repeat(60));
    
    let browser;
    let page;
    
    try {
        // Lançar navegador
        log('Lançando navegador em modo interativo...', 'manual');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            devtools: true, // Abrir DevTools
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
        
        // Adicionar listener para capturar cliques
        await page.evaluateOnNewDocument(() => {
            window.clickCoordinates = [];
            document.addEventListener('click', (event) => {
                const coords = {
                    x: event.clientX,
                    y: event.clientY,
                    target: event.target.tagName,
                    text: event.target.textContent?.trim() || '',
                    className: event.target.className,
                    id: event.target.id
                };
                window.clickCoordinates.push(coords);
                console.log('🎯 Clique capturado:', coords);
            });
        });
        
        // Login
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
            await userField.type('tropicalplay', { delay: 80 });
            await sleep(300);
            
            await passField.click();
            await passField.type('Virginia13', { delay: 80 });
            await sleep(300);
            
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
            await searchField.type(clienteId, { delay: 80 });
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
            await sleep(3000);
            
            // Abrir dropdown automaticamente
            log('Procurando e abrindo dropdown...', 'manual');
            const packageDropdown = await page.$('[data-test="package_id"]');
            if (packageDropdown) {
                log('Dropdown encontrado! Abrindo...', 'success');
                
                try {
                    await packageDropdown.click();
                    log('Dropdown aberto!', 'success');
                } catch (error) {
                    log('Clique normal falhou, tentando JavaScript...', 'warning');
                    await page.evaluate(el => el.click(), packageDropdown);
                    log('Dropdown aberto com JavaScript!', 'success');
                }
                
                await sleep(2000);
                
                // Aguardar opções carregarem
                try {
                    await page.waitForSelector('.el-select-dropdown__item', { timeout: 5000 });
                    log('Opções do dropdown carregadas!', 'success');
                } catch (error) {
                    log('Timeout aguardando opções, mas continuando...', 'warning');
                }
                
                console.log('\n🎯 INSTRUÇÕES:');
                console.log('1. O dropdown está aberto');
                console.log('2. Clique na opção "PLANO COMPLETO - SEMESTRAL" (6 meses)');
                console.log('3. As coordenadas serão capturadas automaticamente');
                console.log('4. Aguarde 60 segundos para análise...');
                console.log('');
                
                // Aguardar 60 segundos para interação manual
                log('👤 AGUARDANDO CLIQUE MANUAL na opção de 6 meses...', 'manual');
                await sleep(60000);
                
                // Capturar coordenadas dos cliques
                const coordinates = await page.evaluate(() => {
                    return window.clickCoordinates || [];
                });
                
                console.log('\n📸 COORDENADAS CAPTURADAS:');
                if (coordinates.length > 0) {
                    coordinates.forEach((coord, i) => {
                        console.log(`\n${i + 1}. Clique em (${coord.x}, ${coord.y})`);
                        console.log(`   Elemento: ${coord.target}`);
                        console.log(`   Texto: "${coord.text}"`);
                        console.log(`   Classe: ${coord.className}`);
                        console.log(`   ID: ${coord.id}`);
                        
                        // Se encontrou a opção de 6 meses
                        if (coord.text.includes('SEMESTRAL') || coord.text.includes('6')) {
                            console.log(`   🎯 ESTA É A COORDENADA PARA 6 MESES!`);
                            console.log(`   📋 Use: await page.mouse.click(${coord.x}, ${coord.y});`);
                        }
                    });
                } else {
                    console.log('❌ Nenhuma coordenada capturada');
                }
                
            } else {
                log('❌ Dropdown não encontrado', 'error');
            }
            
            // Manter navegador aberto para análise adicional
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
        
        console.log('\n🏁 CAPTURA DE COORDENADAS FINALIZADA!');
    }
}

// Validação de argumentos
const clienteId = process.argv[2] || '359503850';

// Executar captura
capturarCoordenadas(clienteId).catch(console.error);
