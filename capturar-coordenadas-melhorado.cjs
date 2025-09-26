/**
 * Capturar Coordenadas Melhorado - Servidor 2 (SpiderTV)
 * 
 * Versão melhorada que aguarda especificamente o clique na opção de 6 meses
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

async function capturarCoordenadasMelhorado(clienteId) {
    console.log('📸 CAPTURAR COORDENADAS MELHORADO - SERVIDOR 2');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`👤 Foco: Capturar clique específico na opção de 6 meses`);
    console.log('='.repeat(60));
    
    let browser;
    let page;
    
    try {
        // Lançar navegador
        log('Lançando navegador em modo interativo...', 'manual');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            devtools: true,
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
        
        // Adicionar listener melhorado para capturar cliques
        await page.evaluateOnNewDocument(() => {
            window.semestralClicks = [];
            document.addEventListener('click', (event) => {
                const text = event.target.textContent?.trim() || '';
                const coords = {
                    x: event.clientX,
                    y: event.clientY,
                    target: event.target.tagName,
                    text: text,
                    className: event.target.className,
                    id: event.target.id,
                    innerHTML: event.target.innerHTML?.substring(0, 100) || ''
                };
                
                // Capturar todos os cliques, mas destacar os relevantes
                console.log('🎯 Clique capturado:', coords);
                
                // Se contém "SEMESTRAL" ou "6", é o que queremos!
                if (text.includes('SEMESTRAL') || text.includes('6 mês') || 
                    coords.innerHTML.includes('SEMESTRAL') || coords.innerHTML.includes('6')) {
                    window.semestralClicks.push(coords);
                    console.log('🎯🎯🎯 CLIQUE NA OPÇÃO DE 6 MESES DETECTADO!', coords);
                }
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
                    log('Dropdown aberto!', 'success');
                } catch (error) {
                    log('Clique normal falhou, tentando JavaScript...', 'warning');
                    await page.evaluate(el => el.click(), packageDropdown);
                    log('Dropdown aberto com JavaScript!', 'success');
                }
                
                await sleep(3000);
                
                // Aguardar opções carregarem
                try {
                    await page.waitForSelector('.el-select-dropdown__item', { timeout: 8000 });
                    log('Opções do dropdown carregadas!', 'success');
                } catch (error) {
                    log('Timeout aguardando opções, mas continuando...', 'warning');
                }
                
                // Listar opções disponíveis
                const opcoes = await page.evaluate(() => {
                    const options = document.querySelectorAll('.el-select-dropdown__item, .el-option');
                    return Array.from(options).map((option, index) => ({
                        index: index + 1,
                        text: option.textContent?.trim() || '',
                        visible: option.offsetParent !== null
                    })).filter(opt => opt.visible && opt.text.length > 0);
                });
                
                console.log('\n📋 OPÇÕES DISPONÍVEIS NO DROPDOWN:');
                opcoes.forEach((opcao) => {
                    const marker = opcao.text.includes('SEMESTRAL') ? ' 🎯 <- ESTA É A DE 6 MESES!' : '';
                    console.log(`   ${opcao.index}. "${opcao.text}"${marker}`);
                });
                
                console.log('\n🎯 INSTRUÇÕES ESPECÍFICAS:');
                console.log('1. O dropdown está aberto com as opções listadas acima');
                console.log('2. Clique ESPECIFICAMENTE na opção "PLANO COMPLETO - SEMESTRAL"');
                console.log('3. NÃO clique no dropdown em si, mas na OPÇÃO dentro dele');
                console.log('4. As coordenadas serão capturadas quando você clicar');
                console.log('5. Aguardando por 90 segundos...');
                console.log('');
                
                // Aguardar 90 segundos para interação manual
                log('👤 AGUARDANDO CLIQUE ESPECÍFICO na opção "PLANO COMPLETO - SEMESTRAL"...', 'manual');
                await sleep(90000);
                
                // Capturar coordenadas específicas dos cliques na opção de 6 meses
                const semestralCoordinates = await page.evaluate(() => {
                    return window.semestralClicks || [];
                });
                
                console.log('\n📸 COORDENADAS DA OPÇÃO DE 6 MESES:');
                if (semestralCoordinates.length > 0) {
                    semestralCoordinates.forEach((coord, i) => {
                        console.log(`\n🎯 CLIQUE ${i + 1} NA OPÇÃO DE 6 MESES:`);
                        console.log(`   Coordenadas: (${coord.x}, ${coord.y})`);
                        console.log(`   Elemento: ${coord.target}`);
                        console.log(`   Texto: "${coord.text}"`);
                        console.log(`   Classe: ${coord.className}`);
                        console.log(`   HTML: ${coord.innerHTML}`);
                        console.log(`   📋 CÓDIGO PARA USAR:`);
                        console.log(`   await page.mouse.click(${coord.x}, ${coord.y});`);
                    });
                    
                    // Pegar a melhor coordenada (última clicada)
                    const bestCoord = semestralCoordinates[semestralCoordinates.length - 1];
                    console.log(`\n✅ MELHOR COORDENADA PARA AUTOMAÇÃO:`);
                    console.log(`await page.mouse.click(${bestCoord.x}, ${bestCoord.y});`);
                    
                } else {
                    console.log('❌ Nenhum clique na opção de 6 meses foi detectado');
                    console.log('💡 Certifique-se de clicar na opção "PLANO COMPLETO - SEMESTRAL"');
                }
                
            } else {
                log('❌ Dropdown não encontrado', 'error');
            }
            
            // Manter navegador aberto para análise adicional
            log('Mantendo navegador aberto por mais 20 segundos...', 'manual');
            await sleep(20000);
            
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
capturarCoordenadasMelhorado(clienteId).catch(console.error);
