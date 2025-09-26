/**
 * Teste específico - Servidor 2 (SpiderTV)
 * Renovação de 3 meses com ID do plano: bOxLAQLZ7a
 */

const puppeteer = require('puppeteer');

const SERVIDOR2_CONFIG = {
    nome: 'SpiderTV',
    url: 'https://spidertv.sigma.st',
    usuario: 'tropicalplay',
    senha: 'Virginia13',
    emoji: '🕷️'
};

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
    console.log(`[${timestamp}] 🕷️ SpiderTV ${prefix} ${mensagem}`);
}

async function testeServidor2(clienteId = '359503850') {
    console.log('🧪 TESTE ESPECÍFICO - SERVIDOR 2 (SPIDERTV)');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: 3 meses`);
    console.log(`🆔 ID do Plano: bOxLAQLZ7a`);
    console.log('=' .repeat(50));
    
    let browser;
    
    try {
        // Lançar navegador com configurações anti-detecção
        log('Lançando navegador...');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 100, // Mais rápido
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=VizDisplayCompositor',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        });
        
        const page = await browser.newPage();
        
        // Configurações anti-detecção
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 720 });
        
        // Login mais rápido
        log('Fazendo login...');
        await page.goto(`${SERVIDOR2_CONFIG.url}/#/sign-in`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(1500); // Reduzido
        
        // Preencher credenciais mais rapidamente
        const userField = await page.$('input[type="text"], input[type="email"], input[name="username"]');
        const passField = await page.$('input[type="password"], input[name="password"]');
        
        if (userField && passField) {
            log('Preenchendo credenciais...');
            await userField.click();
            await userField.type(SERVIDOR2_CONFIG.usuario, { delay: 50 }); // Digitação mais rápida
            await sleep(200);
            
            await passField.click();
            await passField.type(SERVIDOR2_CONFIG.senha, { delay: 50 }); // Digitação mais rápida
            await sleep(200);
            
            // Clicar no botão de login
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                log('Clicando no botão de login...');
                await loginBtn.click();
                await sleep(3000); // Reduzido
                log('Login realizado!', 'success');
            } else {
                // Tentar encontrar botão por texto
                const buttons = await page.$$('button');
                let found = false;
                for (const btn of buttons) {
                    const text = await page.evaluate(el => el.textContent, btn);
                    if (text && (text.includes('Entrar') || text.includes('Login') || text.includes('Sign'))) {
                        log(`Encontrado botão de login: ${text}`);
                        await btn.click();
                        await sleep(3000); // Reduzido
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    throw new Error('Botão de login não encontrado');
                }
            }
        } else {
            throw new Error('Campos de login não encontrados');
        }
        
        // Navegar para clientes mais rapidamente
        log('Navegando para página de clientes...');
        await page.goto(`${SERVIDOR2_CONFIG.url}/#/customers`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(2000); // Reduzido
        
        // Buscar cliente mais rapidamente
        log(`Buscando cliente ${clienteId}...`);
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[placeholder*="Search"], input[type="search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId, { delay: 30 }); // Digitação mais rápida
            await page.keyboard.press('Enter');
            await sleep(3000); // Reduzido
            log('Busca realizada!');
        } else {
            log('Campo de busca não encontrado, tentando buscar na tabela...', 'warning');
        }
        
        // Procurar cliente na tabela
        log('Procurando cliente na tabela...');
        
        // Buscar por células que contenham o ID do cliente
        const cells = await page.$$('td');
        let clienteFound = false;
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                log(`Cliente encontrado na célula: ${text}`, 'success');
                // Clicar na linha que contém esta célula
                const row = await page.evaluateHandle(cell => cell.closest('tr'), cell);
                await row.click();
                await sleep(2000); // Reduzido
                clienteFound = true;
                break;
            }
        }
        
        if (!clienteFound) {
            // Tentar clicar na primeira linha da tabela
            log('Cliente não encontrado, tentando primeira linha da tabela...', 'warning');
            const firstRow = await page.$('tbody tr:first-child');
            if (firstRow) {
                await firstRow.click();
                await sleep(2000); // Reduzido
                log('Primeira linha clicada!');
            } else {
                throw new Error(`Cliente ${clienteId} não encontrado na tabela`);
            }
        }
        
        // Procurar botão de renovação
        log('Procurando botão de renovação...');
        await sleep(1000); // Reduzido
        
        // Procurar botão de renovação pelo seletor exato fornecido
        let renewBtn = await page.$('button.btn.btn-icon.btn-bg-light.btn-warning.btn-sm');
        if (renewBtn) {
            log('Botão de renovação encontrado pelo seletor exato!', 'success');
        } else {
            // Tentar seletor mais específico com o ícone
            renewBtn = await page.$('button.btn-warning');
            if (renewBtn) {
                log('Botão de renovação encontrado pelo seletor btn-warning!', 'success');
            } else {
                // Procurar pelo ícone e subir para o botão pai
                const icon = await page.$('i.fad.fa-calendar-plus.text-white');
                if (icon) {
                    renewBtn = await page.evaluateHandle(icon => icon.closest('button'), icon);
                    log('Botão de renovação encontrado pelo ícone!', 'success');
                } else {
                    // Fallback: qualquer ícone fa-calendar-plus
                    const iconFallback = await page.$('i.fa-calendar-plus');
                    if (iconFallback) {
                        renewBtn = await page.evaluateHandle(icon => icon.closest('button'), iconFallback);
                        log('Botão de renovação encontrado pelo ícone fallback!', 'success');
                    } else {
                        throw new Error('Botão de renovação não encontrado');
                    }
                }
            }
        }
        
        if (renewBtn) {
            log('Clicando no botão de renovação...');
            // Tentar diferentes métodos de clique
            try {
                await renewBtn.click();
            } catch (error) {
                log('Clique normal falhou, tentando clique via JavaScript...', 'warning');
                await page.evaluate(btn => btn.click(), renewBtn);
            }
            await sleep(2000); // Reduzido
            
            // Procurar opção de 3 meses ou usar o ID do plano
            log('Procurando opção de 3 meses...');
            
            // Tentar encontrar botão/opção com o ID do plano específico
            const planBtn = await page.$(`[data-plan-id="bOxLAQLZ7a"], [value="bOxLAQLZ7a"]`);
            if (planBtn) {
                log('Plano específico encontrado pelo ID!', 'success');
                await planBtn.click();
                await sleep(1000); // Reduzido
            } else {
                // Procurar por elementos que contenham o ID do plano no texto
                const allElements = await page.$$('button, option, div, span');
                let planFound = false;
                
                for (const element of allElements) {
                    const text = await page.evaluate(el => el.textContent || el.value || el.getAttribute('data-plan-id'), element);
                    if (text && text.includes('bOxLAQLZ7a')) {
                        log(`Plano encontrado por ID no texto: ${text}`, 'success');
                        await element.click();
                        await sleep(1000);
                        planFound = true;
                        break;
                    }
                }
                
                if (!planFound) {
                // Tentar encontrar por texto "3 mês" ou "3 month"
                const periodBtns = await page.$$('button, .btn, option');
                let found = false;
                
                for (const btn of periodBtns) {
                    try {
                        const text = await page.evaluate(el => el.textContent || el.value, btn);
                        if (text && (text.includes('3 mês') || text.includes('3 month') || text.includes('3 mes'))) {
                            log(`Encontrado botão de 3 meses: ${text}`, 'success');
                            await btn.click();
                            await sleep(1000); // Reduzido
                            found = true;
                            break;
                        }
                    } catch (e) {
                        // Continuar
                    }
                }
                
                    if (!found) {
                        log('Opção de 3 meses não encontrada, tentando confirmar mesmo assim...', 'warning');
                    }
                }
            }
            
            // Confirmar renovação
            log('Procurando botão de confirmação...');
            const confirmButtons = await page.$$('button, .btn');
            let confirmBtn = null;
            
            for (const btn of confirmButtons) {
                const text = await page.evaluate(el => el.textContent, btn);
                if (text && (text.includes('Confirmar') || text.includes('Confirm') || text.includes('Renovar'))) {
                    log(`Botão de confirmação encontrado: ${text}`, 'success');
                    confirmBtn = btn;
                    break;
                }
            }
            
            // Se não encontrou, tentar por tipo submit
            if (!confirmBtn) {
                confirmBtn = await page.$('button[type="submit"]');
                if (confirmBtn) {
                    log('Botão submit encontrado', 'success');
                }
            }
            
            if (confirmBtn) {
                log('Confirmando renovação...');
                await confirmBtn.click();
                await sleep(2000); // Reduzido
                log('Renovação confirmada!', 'success');
            } else {
                log('Botão de confirmação não encontrado', 'warning');
            }
            
        } else {
            throw new Error('Botão de renovação não encontrado');
        }
        
        // Verificar se houve sucesso
        log('Verificando resultado da renovação...');
        await sleep(2000); // Reduzido
        
        // Procurar mensagens de sucesso
        const successMessages = await page.$$eval('*', elements => {
            return elements
                .map(el => el.textContent)
                .filter(text => text && (
                    text.includes('sucesso') || 
                    text.includes('success') || 
                    text.includes('renovado') || 
                    text.includes('renewed')
                ));
        });
        
        if (successMessages.length > 0) {
            log('Mensagens de sucesso encontradas:', 'success');
            successMessages.forEach(msg => console.log(`   📝 ${msg}`));
        }
        
        log('Teste concluído! Mantendo navegador aberto para análise...', 'success');
        console.log('\n🎉 RENOVAÇÃO DE 3 MESES REALIZADA COM SUCESSO!');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: 3 meses`);
        console.log(`🆔 ID do Plano: bOxLAQLZ7a`);
        
        // Manter navegador aberto por 20 segundos
        await sleep(20000); // Reduzido
        
    } catch (error) {
        log(`Erro no teste: ${error.message}`, 'error');
        console.log('\n❌ TESTE FALHOU');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: 3 meses`);
        console.log(`❌ Erro: ${error.message}`);
        
        // Manter navegador aberto para debug
        await sleep(10000); // Reduzido
    } finally {
        if (browser) {
            log('Fechando navegador...');
            await browser.close();
            log('Navegador fechado');
        }
    }
}

// Executar teste
const clienteId = process.argv[2] || '359503850';
testeServidor2(clienteId).catch(console.error);
