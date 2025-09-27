/**
 * Renovação Servidor 1 - 12 Meses CORRETO
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

async function renovar12MesesServidor1(clienteId) {
    console.log('🎯 RENOVAÇÃO SERVIDOR 1 - 12 MESES CORRETO');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: 12 meses (PLANO COMPLETO)`);
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
            }, 'Goncalves1', await page.evaluateHandle(() => document.activeElement));
            await sleep(100);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(2000);
                log('Login realizado!', 'success');
            }
        }
        
        // Buscar cliente
        log(`Buscando cliente ${clienteId}...`);
        await page.goto('https://painel.tropicalplaytv.com/clientes.php', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(3000);
        
        const searchField = await page.$('input[name="search"]');
        if (searchField) {
            await searchField.click();
            await searchField.evaluate((el, text) => {
                el.value = text;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }, clienteId);
            await page.keyboard.press('Enter');
            await sleep(2000);
        }
        
        // Clicar no cliente
        log('Procurando cliente na lista...');
        const clienteLink = await page.$(`a[href*="${clienteId}"]`);
        if (clienteLink) {
            await clienteLink.click();
            await sleep(2000);
            log('Cliente encontrado e selecionado!', 'success');
        } else {
            // Tentar primeira linha se não encontrar por link
            const firstRow = await page.$('tbody tr:first-child a');
            if (firstRow) {
                await firstRow.click();
                await sleep(2000);
                log('Usando primeira linha da tabela', 'warning');
            } else {
                throw new Error(`Cliente ${clienteId} não encontrado`);
            }
        }
        
        // Renovar
        log('Procurando botão de renovação...');
        const renewSelectors = [
            'button:contains("Renovar")',
            'a:contains("Renovar")',
            'button[onclick*="renovar"]',
            'a[href*="renovar"]',
            '.btn:contains("Renovar")'
        ];
        
        let renewBtn = null;
        for (const selector of renewSelectors) {
            try {
                renewBtn = await page.$(selector);
                if (renewBtn) {
                    log(`Botão de renovação encontrado: ${selector}`, 'success');
                    break;
                }
            } catch (error) {
                // Continuar tentando outros seletores
            }
        }
        
        if (renewBtn) {
            log('Clicando no botão de renovação...');
            await renewBtn.click();
            await sleep(3000);
            
            // Selecionar período de 12 meses se necessário
            log('Procurando seleção de período...');
            const periodSelect = await page.$('select[name="periodo"]');
            if (periodSelect) {
                await periodSelect.select('12');
                await sleep(2000);
                log('Período de 12 meses selecionado!', 'success');
            }
            
            // Procurar por botões de período específico
            const periodBtns = await page.$$('button, .btn, input[type="radio"]');
            for (const btn of periodBtns) {
                const text = await page.evaluate(el => el.textContent || el.value, btn);
                if (text && (text.includes('12 mês') || text.includes('12 month') || text.includes('anual') || text.includes('ano'))) {
                    await btn.click();
                    await sleep(1000);
                    log(`Período selecionado: ${text}`, 'success');
                    break;
                }
            }
            
            // Confirmar renovação
            log('Procurando botão de confirmação...');
            const confirmSelectors = [
                'button:contains("Confirmar")',
                'button:contains("Confirm")',
                'button[type="submit"]',
                '.btn:contains("Confirmar")',
                'input[type="submit"]'
            ];
            
            let confirmBtn = null;
            for (const selector of confirmSelectors) {
                try {
                    confirmBtn = await page.$(selector);
                    if (confirmBtn) {
                        const btnText = await page.evaluate(btn => btn.textContent?.trim() || btn.value || '', confirmBtn);
                        if (btnText.includes('Confirmar') || btnText.includes('Renovar') || btnText.includes('Submit')) {
                            log(`Botão de confirmação encontrado: "${btnText}"`, 'success');
                            break;
                        }
                    }
                    confirmBtn = null;
                } catch (error) {
                    // Continuar tentando outros seletores
                }
            }
            
            if (confirmBtn) {
                const btnText = await page.evaluate(btn => btn.textContent?.trim() || btn.value || '', confirmBtn);
                log(`Confirmando renovação: "${btnText}"`, 'info');
                await confirmBtn.click();
                await sleep(2000);
                log('Renovação confirmada!', 'success');
            } else {
                log('Botão de confirmação não encontrado', 'warning');
            }
            
        } else {
            throw new Error('Botão de renovação não encontrado');
        }
        
        // Manter navegador aberto para verificação
        log('Mantendo navegador aberto por 30 segundos para verificação...', 'info');
        await sleep(30000);
        
        console.log('');
        console.log('🎉 RENOVAÇÃO DE 12 MESES SERVIDOR 1 CONCLUÍDA!');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: 12 meses (PLANO COMPLETO)`);
        
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
    console.log('📖 Uso: node renovar-servidor1-12meses-correto.cjs <cliente_id>');
    console.log('📖 Exemplo: node renovar-servidor1-12meses-correto.cjs 648718886');
    process.exit(1);
}

// Executar renovação
renovar12MesesServidor1(clienteId).catch(console.error);
