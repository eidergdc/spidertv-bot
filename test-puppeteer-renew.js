/**
 * Teste de renovação usando Puppeteer (baseado no bot.js existente)
 */

const puppeteer = require('puppeteer');

console.log('🕷️ Teste de renovação SpiderTV com Puppeteer...');

// Configurações
const SPIDERTV_URL = 'https://spidertv.sigma.st';
const CLIENT_CODE = '364572675';
const MONTHS = 1;

// Credenciais (você precisa definir estas)
const USERNAME = process.env.SERVER2_USER || 'seu_email@exemplo.com';
const PASSWORD = process.env.SERVER2_PASS || 'sua_senha';

console.log('URL:', SPIDERTV_URL);
console.log('Cliente:', CLIENT_CODE);
console.log('Meses:', MONTHS);
console.log('Username:', USERNAME);

class SpiderTVBot {
    constructor() {
        this.baseUrl = SPIDERTV_URL;
        this.username = USERNAME;
        this.password = PASSWORD;
        this.browser = null;
        this.page = null;
    }

    async initialize() {
        console.log('🚀 Inicializando navegador...');
        this.browser = await puppeteer.launch({
            headless: false, // Visível para debug
            slowMo: 500, // Mais devagar para acompanhar
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        console.log('✅ Navegador inicializado');
    }

    async login() {
        try {
            console.log('🔐 Fazendo login...');
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });

            // Aguardar um pouco para a página carregar
            await this.page.waitForTimeout(2000);

            // Tirar screenshot da página inicial
            await this.page.screenshot({ path: 'debug-spidertv-initial.png', fullPage: true });
            console.log('📸 Screenshot inicial: debug-spidertv-initial.png');

            // Procurar campos de login
            console.log('🔍 Procurando campos de login...');
            
            const emailSelector = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
            const passwordSelector = 'input[type="password"], input[name="password"]';
            
            await this.page.waitForSelector(emailSelector, { timeout: 10000 });
            await this.page.waitForSelector(passwordSelector, { timeout: 10000 });
            
            console.log('✅ Campos de login encontrados');

            // Preencher formulário de login
            await this.page.type(emailSelector, this.username);
            await this.page.type(passwordSelector, this.password);

            console.log('✅ Credenciais preenchidas');

            // Tirar screenshot antes do login
            await this.page.screenshot({ path: 'debug-before-login.png', fullPage: true });
            console.log('📸 Screenshot antes do login: debug-before-login.png');

            // Clicar no botão de login
            const loginButtonSelector = 'button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), input[type="submit"]';
            await this.page.click(loginButtonSelector);

            console.log('🔄 Botão de login clicado, aguardando...');

            // Aguardar redirecionamento
            await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

            // Tirar screenshot após login
            await this.page.screenshot({ path: 'debug-after-login.png', fullPage: true });
            console.log('📸 Screenshot após login: debug-after-login.png');

            // Verificar se login foi bem-sucedido
            const currentUrl = this.page.url();
            console.log('🌐 URL atual:', currentUrl);

            if (currentUrl !== this.baseUrl && !currentUrl.includes('/login')) {
                console.log('✅ Login realizado com sucesso!');
                return true;
            } else {
                console.log('❌ Falha no login - ainda na página de login');
                return false;
            }
        } catch (error) {
            console.error('❌ Erro durante login:', error.message);
            await this.page.screenshot({ path: 'debug-login-error.png', fullPage: true });
            return false;
        }
    }

    async findAndRenewClient(clientCode, months) {
        try {
            console.log(`🔍 Procurando cliente ${clientCode}...`);

            // Procurar página de clientes
            console.log('📋 Navegando para página de clientes...');
            
            // Tentar encontrar link de clientes
            const clientsSelectors = [
                'a[href*="client"]',
                'a:contains("Client")',
                'a:contains("Customer")',
                'a[href*="customer"]',
                'a:contains("Clientes")'
            ];

            let clientsFound = false;
            for (const selector of clientsSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 2000 });
                    await this.page.click(selector);
                    console.log(`✅ Clicou em link de clientes: ${selector}`);
                    clientsFound = true;
                    break;
                } catch (e) {
                    // Continuar tentando
                }
            }

            if (!clientsFound) {
                // Tentar URL direta
                console.log('⚠️ Link não encontrado, tentando URL direta...');
                await this.page.goto(`${this.baseUrl}/customers`, { waitUntil: 'networkidle2' });
            }

            await this.page.waitForTimeout(2000);

            // Tirar screenshot da página de clientes
            await this.page.screenshot({ path: 'debug-clients-page.png', fullPage: true });
            console.log('📸 Screenshot página de clientes: debug-clients-page.png');

            // Procurar campo de busca
            console.log('🔍 Procurando campo de busca...');
            const searchSelectors = [
                'input[type="search"]',
                'input[name="search"]',
                'input[placeholder*="search" i]',
                'input[placeholder*="buscar" i]'
            ];

            let searchFound = false;
            for (const selector of searchSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 2000 });
                    await this.page.type(selector, clientCode);
                    await this.page.keyboard.press('Enter');
                    console.log(`✅ Busca realizada com: ${selector}`);
                    searchFound = true;
                    break;
                } catch (e) {
                    // Continuar tentando
                }
            }

            if (!searchFound) {
                console.log('⚠️ Campo de busca não encontrado');
            }

            await this.page.waitForTimeout(3000);

            // Tirar screenshot após busca
            await this.page.screenshot({ path: 'debug-after-search.png', fullPage: true });
            console.log('📸 Screenshot após busca: debug-after-search.png');

            // Procurar botões de renovação
            console.log('🔄 Procurando botões de renovação...');
            const renewSelectors = [
                'button:contains("Renew")',
                'button:contains("Renovar")',
                'a:contains("Renew")',
                'a:contains("Renovar")',
                'button[title*="renew" i]',
                'a[title*="renew" i]'
            ];

            let renewFound = false;
            for (const selector of renewSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 2000 });
                    await this.page.click(selector);
                    console.log(`✅ Clicou em botão de renovação: ${selector}`);
                    renewFound = true;
                    break;
                } catch (e) {
                    // Continuar tentando
                }
            }

            if (!renewFound) {
                console.log('❌ Botão de renovação não encontrado');
                return false;
            }

            await this.page.waitForTimeout(2000);

            // Tirar screenshot da tela de renovação
            await this.page.screenshot({ path: 'debug-renewal-screen.png', fullPage: true });
            console.log('📸 Screenshot tela de renovação: debug-renewal-screen.png');

            // Procurar campo de meses
            const monthsSelectors = [
                'input[name*="month"]',
                'select[name*="month"]',
                'input[placeholder*="month"]'
            ];

            for (const selector of monthsSelectors) {
                try {
                    const element = await this.page.$(selector);
                    if (element) {
                        const tagName = await this.page.evaluate(el => el.tagName, element);
                        if (tagName === 'SELECT') {
                            await this.page.select(selector, months.toString());
                        } else {
                            await this.page.type(selector, months.toString());
                        }
                        console.log(`✅ Meses definidos: ${months}`);
                        break;
                    }
                } catch (e) {
                    // Continuar tentando
                }
            }

            // Procurar botão de confirmação
            const confirmSelectors = [
                'button:contains("Confirm")',
                'button:contains("Confirmar")',
                'button[type="submit"]',
                'button:contains("Save")',
                'button:contains("Salvar")'
            ];

            for (const selector of confirmSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 2000 });
                    await this.page.click(selector);
                    console.log(`✅ Confirmação clicada: ${selector}`);
                    break;
                } catch (e) {
                    // Continuar tentando
                }
            }

            await this.page.waitForTimeout(3000);

            // Screenshot final
            await this.page.screenshot({ path: 'debug-final-result.png', fullPage: true });
            console.log('📸 Screenshot resultado final: debug-final-result.png');

            console.log('🎉 Processo de renovação concluído!');
            return true;

        } catch (error) {
            console.error('❌ Erro durante renovação:', error.message);
            await this.page.screenshot({ path: 'debug-renewal-error.png', fullPage: true });
            return false;
        }
    }

    async close() {
        if (this.browser) {
            console.log('🔄 Aguardando 5 segundos para inspeção...');
            await this.page.waitForTimeout(5000);
            await this.browser.close();
            console.log('✅ Navegador fechado');
        }
    }
}

// Executar teste
async function runTest() {
    const bot = new SpiderTVBot();

    try {
        await bot.initialize();
        
        const loginSuccess = await bot.login();
        if (!loginSuccess) {
            throw new Error('Falha no login');
        }

        const renewalSuccess = await bot.findAndRenewClient(CLIENT_CODE, MONTHS);
        
        if (renewalSuccess) {
            console.log('🎉 Renovação realizada com sucesso!');
        } else {
            console.log('❌ Falha na renovação');
        }

    } catch (error) {
        console.error('💥 Erro fatal:', error.message);
    } finally {
        await bot.close();
    }
}

runTest();
