const { chromium } = require('playwright');

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

async function renovar1MesServidor1(clienteId) {
    console.log('🎯 RENOVAÇÃO SERVIDOR 1 - 1 MÊS COM PLAYWRIGHT');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: 1 mês (PLANO COMPLETO)`);
    console.log('='.repeat(60));
    
    let browser;
    let page;
    
    try {
        // Lançar navegador
        log('Lançando navegador...');
        browser = await chromium.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        
        page = await browser.newPage();
        
        // Configurações anti-detecção
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
        
        await page.setViewportSize({ width: 1280, height: 720 });
        
        // Login
        log('Fazendo login...');
        await page.goto('https://painel.tropicalplaytv.com', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        await sleep(2000);
        
        const userField = page.locator('input[name="username"]');
        const passField = page.locator('input[name="password"]');
        
        if (await userField.count() > 0 && await passField.count() > 0) {
            await userField.fill('Eider Goncalves');
            await sleep(100);
            
            await passField.fill('Goncalves1');
            await sleep(100);
            
            const loginBtn = page.locator('button[type="submit"]');
            if (await loginBtn.count() > 0) {
                await loginBtn.click();
                await sleep(2000);
                log('Login realizado!', 'success');
            }
        }
        
        // Buscar cliente
        log(`Buscando cliente ${clienteId}...`);
        await page.goto('https://painel.tropicalplaytv.com/iptv/clients', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        await sleep(3000);
        
        const searchField = page.locator('input[name="search"]');
        if (await searchField.count() > 0) {
            await searchField.fill(clienteId);
            await page.keyboard.press('Enter');
            await sleep(2000);
        }
        
        // Clicar no cliente
        log('Procurando cliente na lista...');
        const clienteLink = page.locator(`a[href*="${clienteId}"]`);
        if (await clienteLink.count() > 0) {
            await clienteLink.click();
            await sleep(2000);
            log('Cliente encontrado e selecionado!', 'success');
        } else {
            // Tentar primeira linha se não encontrar por link
            const firstRow = page.locator('tbody tr:first-child a');
            if (await firstRow.count() > 0) {
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
                renewBtn = page.locator(selector);
                if (await renewBtn.count() > 0) {
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
            
            // Selecionar período de 1 mês se necessário
            log('Procurando seleção de período...');
            const periodSelect = page.locator('select[name="periodo"]');
            if (await periodSelect.count() > 0) {
                await periodSelect.selectOption('1');
                await sleep(2000);
                log('Período de 1 mês selecionado!', 'success');
            }
            
            // Procurar por botões de período específico
            const periodBtns = page.locator('button, .btn, input[type="radio"]');
            const count = await periodBtns.count();
            for (let i = 0; i < count; i++) {
                const btn = periodBtns.nth(i);
                const text = await btn.textContent();
                if (text && (text.includes('1 mês') || text.includes('1 month') || text.includes('mensal'))) {
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
                    confirmBtn = page.locator(selector);
                    if (await confirmBtn.count() > 0) {
                        const btnText = await confirmBtn.textContent();
                        if (btnText && (btnText.includes('Confirmar') || btnText.includes('Renovar') || btnText.includes('Submit'))) {
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
                const btnText = await confirmBtn.textContent();
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
        console.log('🎉 RENOVAÇÃO DE 1 MÊS SERVIDOR 1 CONCLUÍDA!');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: 1 mês (PLANO COMPLETO)`);
        
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
    console.log('📖 Uso: node renovar-playwright.cjs <cliente_id>');
    console.log('📖 Exemplo: node renovar-playwright.cjs 648718886');
    process.exit(1);
}

// Executar renovação
renovar1MesServidor1(clienteId).catch(console.error);
