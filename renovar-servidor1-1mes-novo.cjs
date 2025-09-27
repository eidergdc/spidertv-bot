/**
 * Renovação Servidor 1 - 1 Mês CORRETO
 * 
 * TropicalPlayTV - Renovação via automação web
 * Fluxo correto: Login → /iptv/clients → Pesquisar → Botão Calendar → Modal → Confirmar
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

async function renovar1MesServidor1(clienteId) {
    console.log('🎯 RENOVAÇÃO SERVIDOR 1 - 1 MÊS CORRETO');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: 1 mês`);
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
            // Colar usuário
            await userField.click();
            await page.evaluate((el, text) => {
                el.value = text;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }, userField, 'Eider Goncalves');
            await sleep(500);
            
            // Colar senha
            await passField.click();
            await page.evaluate((el, text) => {
                el.value = text;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }, passField, 'Goncalves1@');
            await sleep(500);
            
            // Procurar e clicar no botão de login
            const loginSelectors = [
                '.login100-form-btn',
                '#button-login',
                'button[type="submit"]',
                'input[type="submit"]',
                '.btn-primary',
                'button.btn',
                '[value="Entrar"]',
                '[value="Login"]'
            ];
            
            let loginBtn = null;
            for (const selector of loginSelectors) {
                try {
                    loginBtn = await page.$(selector);
                    if (loginBtn) {
                        log(`Botão de login encontrado: ${selector}`, 'success');
                        break;
                    }
                } catch (error) {
                    // Continuar tentando outros seletores
                }
            }
            
            if (loginBtn) {
                log('Clicando no botão de login...');
                await loginBtn.click();
                
                // Aguardar redirecionamento após login
                try {
                    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 });
                    log('Login realizado com sucesso!', 'success');
                } catch (error) {
                    log('Aguardando login processar...', 'warning');
                    await sleep(5000);
                }
            } else {
                throw new Error('Botão de login não encontrado');
            }
        } else {
            throw new Error('Campos de usuário ou senha não encontrados');
        }
        
        // 3. Navegar para página de clientes IPTV
        log('Navegando para página de clientes IPTV...');
        await page.goto('https://painel.tropicalplaytv.com/iptv/clients', { 
            waitUntil: 'networkidle2', 
            timeout: 30000 
        });
        await sleep(5000);
        
        // Aguardar a tabela carregar
        log('Aguardando tabela carregar...');
        try {
            await page.waitForSelector('table', { timeout: 10000 });
            log('Tabela encontrada!', 'success');
        } catch (error) {
            log('Tabela não encontrada, continuando...', 'warning');
        }
        
        // 4. Pesquisar cliente
        log(`Pesquisando cliente ${clienteId}...`);
        
        // Tentar diferentes seletores para o campo de pesquisa
        const searchSelectors = [
            'input[type="search"].form-control.form-control-sm',
            'input[type="search"]',
            'input.form-control-sm',
            'input[placeholder*=""]',
            'input[aria-controls="table"]',
            '#table_filter input',
            '.dataTables_filter input'
        ];
        
        let searchField = null;
        for (const selector of searchSelectors) {
            try {
                searchField = await page.$(selector);
                if (searchField) {
                    log(`Campo de pesquisa encontrado: ${selector}`, 'success');
                    break;
                }
            } catch (error) {
                // Continuar tentando outros seletores
            }
        }
        
        if (searchField) {
            await searchField.click();
            await searchField.type(clienteId, { delay: 100 });
            await page.keyboard.press('Enter');
            await sleep(3000);
            log('Pesquisa realizada!', 'success');
        } else {
            throw new Error('Campo de pesquisa não encontrado');
        }
        
        // 5. Clicar no botão calendar
        log('Procurando botão de renovação (calendar)...');
        const calendarBtn = await page.$('i.fad.fa-calendar-alt');
        if (calendarBtn) {
            log('Botão calendar encontrado, clicando...', 'success');
            await calendarBtn.click();
            await sleep(2000);
        } else {
            throw new Error('Botão calendar não encontrado');
        }
        
        // 6. Aguardar modal aparecer
        log('Aguardando modal de renovação...');
        await page.waitForSelector('.bootbox.modal.fade.show', { timeout: 10000 });
        log('Modal de renovação aberto!', 'success');
        
        // 7. Configurar quantidade de meses
        log('Configurando período de 1 mês...');
        const monthsInput = await page.$('#months');
        if (monthsInput) {
            await monthsInput.click();
            await monthsInput.evaluate(input => input.select());
            await monthsInput.type('1', { delay: 100 });
            await sleep(1000);
            log('Período de 1 mês configurado!', 'success');
        }
        
        // 8. Confirmar renovação
        log('Confirmando renovação...');
        const confirmBtn = await page.$('.btn.btn-info.btnrenewplus');
        if (confirmBtn) {
            await confirmBtn.click();
            await sleep(3000);
            log('Renovação confirmada!', 'success');
        } else {
            throw new Error('Botão de confirmação não encontrado');
        }
        
        // 9. Aguardar resultado
        log('Aguardando resultado da renovação...');
        await sleep(5000);
        
        console.log('');
        console.log('🎉 RENOVAÇÃO DE 1 MÊS SERVIDOR 1 CONCLUÍDA!');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: 1 mês`);
        
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
    console.log('📖 Uso: node renovar-servidor1-1mes-novo.cjs <cliente_id>');
    console.log('📖 Exemplo: node renovar-servidor1-1mes-novo.cjs 648718886');
    process.exit(1);
}

// Executar renovação
renovar1MesServidor1(clienteId).catch(console.error);
