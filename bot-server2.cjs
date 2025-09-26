const puppeteer = require('puppeteer');

class SpiderTVBot {
    constructor() {
        this.baseUrl = 'https://spidertv.sigma.st';
        this.username = process.env.SERVER2_USER || 'seu_email@exemplo.com';
        this.password = process.env.SERVER2_PASS || 'sua_senha';
        this.browser = null;
        this.page = null;
        this.cookies = null;
    }

    async initialize() {
        console.log('🚀 Inicializando navegador...');
        this.browser = await puppeteer.launch({
            headless: false, // Para você ver o navegador
            slowMo: 1000,    // Mais devagar para acompanhar
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        console.log('✅ Navegador inicializado');
    }

    async login() {
        try {
            console.log('🔐 Fazendo login no SpiderTV...');
            console.log('🌐 URL:', this.baseUrl);
            console.log('👤 Usuário:', this.username);
            
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
            console.log('✅ Página carregada');

            // Aguardar um pouco
            await this.page.waitForTimeout(3000);

            // Tirar screenshot inicial
            await this.page.screenshot({ path: 'spidertv-inicial.png', fullPage: true });
            console.log('📸 Screenshot inicial salvo: spidertv-inicial.png');

            // Procurar campos de login
            console.log('🔍 Procurando campos de login...');
            
            // Aguardar campos aparecerem
            try {
                await this.page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
                console.log('✅ Campo de email encontrado');
            } catch (e) {
                console.log('⚠️ Campo de email não encontrado, continuando...');
            }

            try {
                await this.page.waitForSelector('input[type="password"]', { timeout: 5000 });
                console.log('✅ Campo de senha encontrado');
            } catch (e) {
                console.log('⚠️ Campo de senha não encontrado, continuando...');
            }

            // Preencher formulário de login
            const emailField = await this.page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
            const passwordField = await this.page.$('input[type="password"], input[name="password"]');

            if (emailField && passwordField) {
                console.log('📝 Preenchendo credenciais...');
                await emailField.type(this.username, { delay: 100 });
                await passwordField.type(this.password, { delay: 100 });
                console.log('✅ Credenciais preenchidas');

                // Screenshot antes do login
                await this.page.screenshot({ path: 'spidertv-antes-login.png', fullPage: true });
                console.log('📸 Screenshot antes do login: spidertv-antes-login.png');

                // Clicar no botão de login
                console.log('🔄 Procurando botão de login...');
                const loginButton = await this.page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), input[type="submit"]');
                
                if (loginButton) {
                    console.log('✅ Botão de login encontrado, clicando...');
                    await loginButton.click();

                    // Aguardar redirecionamento
                    console.log('⏳ Aguardando redirecionamento...');
                    try {
                        await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
                        console.log('✅ Redirecionamento concluído');
                    } catch (e) {
                        console.log('⚠️ Timeout no redirecionamento, continuando...');
                    }

                    // Screenshot após login
                    await this.page.screenshot({ path: 'spidertv-apos-login.png', fullPage: true });
                    console.log('📸 Screenshot após login: spidertv-apos-login.png');

                    // Verificar se login foi bem-sucedido
                    const currentUrl = this.page.url();
                    console.log('🌐 URL atual:', currentUrl);

                    if (currentUrl !== this.baseUrl && !currentUrl.includes('/login')) {
                        console.log('✅ Login realizado com sucesso!');
                        
                        // Salvar cookies para uso posterior
                        this.cookies = await this.page.cookies();
                        console.log('🍪 Cookies salvos');
                        
                        return true;
                    } else {
                        console.log('❌ Falha no login - ainda na página de login');
                        return false;
                    }
                } else {
                    console.log('❌ Botão de login não encontrado');
                    return false;
                }
            } else {
                console.log('❌ Campos de login não encontrados');
                console.log('Campo email:', emailField ? 'encontrado' : 'não encontrado');
                console.log('Campo senha:', passwordField ? 'encontrado' : 'não encontrado');
                return false;
            }
        } catch (error) {
            console.error('❌ Erro durante login:', error.message);
            await this.page.screenshot({ path: 'spidertv-erro-login.png', fullPage: true });
            console.log('📸 Screenshot de erro: spidertv-erro-login.png');
            return false;
        }
    }

    async navigateToClients() {
        try {
            console.log('📋 Navegando para página de clientes...');
            
            // Tentar encontrar link de clientes
            const clientsSelectors = [
                'a[href*="client"]',
                'a[href*="customer"]',
                'nav a:contains("Client")',
                'nav a:contains("Customer")',
                'a:contains("Clientes")'
            ];

            let found = false;
            for (const selector of clientsSelectors) {
                try {
                    const element = await this.page.$(selector);
                    if (element) {
                        console.log(`✅ Link encontrado: ${selector}`);
                        await element.click();
                        await this.page.waitForTimeout(2000);
                        found = true;
                        break;
                    }
                } catch (e) {
                    // Continuar tentando
                }
            }

            if (!found) {
                // Tentar URL direta
                console.log('⚠️ Link não encontrado, tentando URL direta...');
                await this.page.goto(`${this.baseUrl}/customers`, { waitUntil: 'networkidle2' });
                await this.page.waitForTimeout(2000);
            }

            // Screenshot da página de clientes
            await this.page.screenshot({ path: 'spidertv-clientes.png', fullPage: true });
            console.log('📸 Screenshot página de clientes: spidertv-clientes.png');
            console.log('✅ Página de clientes carregada!');
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao navegar para clientes:', error.message);
            return false;
        }
    }

    async renewClient(clientId, months = 1) {
        try {
            console.log(`🔄 Renovando cliente ${clientId} por ${months} mês(es)...`);

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
                    const element = await this.page.$(selector);
                    if (element) {
                        console.log(`✅ Campo de busca encontrado: ${selector}`);
                        await element.type(clientId);
                        await this.page.keyboard.press('Enter');
                        await this.page.waitForTimeout(3000);
                        searchFound = true;
                        break;
                    }
                } catch (e) {
                    // Continuar tentando
                }
            }

            if (!searchFound) {
                console.log('⚠️ Campo de busca não encontrado');
            }

            // Screenshot após busca
            await this.page.screenshot({ path: 'spidertv-busca.png', fullPage: true });
            console.log('📸 Screenshot após busca: spidertv-busca.png');

            // Procurar botões de renovação
            console.log('🔄 Procurando botões de renovação...');
            const renewSelectors = [
                'button:contains("Renew")',
                'button:contains("Renovar")',
                'a:contains("Renew")',
                'a:contains("Renovar")',
                'button[title*="renew" i]'
            ];

            let renewFound = false;
            for (const selector of renewSelectors) {
                try {
                    const element = await this.page.$(selector);
                    if (element) {
                        console.log(`✅ Botão de renovação encontrado: ${selector}`);
                        await element.click();
                        await this.page.waitForTimeout(2000);
                        renewFound = true;
                        break;
                    }
                } catch (e) {
                    // Continuar tentando
                }
            }

            if (!renewFound) {
                console.log('❌ Botão de renovação não encontrado');
                return { success: false, error: 'Botão de renovação não encontrado' };
            }

            // Screenshot da tela de renovação
            await this.page.screenshot({ path: 'spidertv-renovacao.png', fullPage: true });
            console.log('📸 Screenshot tela de renovação: spidertv-renovacao.png');

            console.log('🎉 Processo de renovação iniciado!');
            console.log('👀 Aguardando 10 segundos para você ver o resultado...');
            await this.page.waitForTimeout(10000);

            return { success: true, data: `Cliente ${clientId} processado` };

        } catch (error) {
            console.error('❌ Erro durante renovação:', error.message);
            await this.page.screenshot({ path: 'spidertv-erro-renovacao.png', fullPage: true });
            return { success: false, error: error.message };
        }
    }

    async runRenewal(clientId, months = 1) {
        try {
            console.log('🚀 Iniciando processo de renovação no SpiderTV...');
            console.log(`📋 Cliente: ${clientId}`);
            console.log(`📅 Meses: ${months}`);

            // Inicializar browser
            await this.initialize();

            // Fazer login
            const loginSuccess = await this.login();
            if (!loginSuccess) {
                throw new Error('Falha no login');
            }

            // Navegar para clientes
            const navigationSuccess = await this.navigateToClients();
            if (!navigationSuccess) {
                throw new Error('Falha ao navegar para página de clientes');
            }

            // Renovar cliente
            const renewalResult = await this.renewClient(clientId, months);

            return renewalResult;
        } catch (error) {
            console.error('❌ Erro no processo de renovação:', error.message);
            return { success: false, error: error.message };
        } finally {
            console.log('🔄 Aguardando 5 segundos antes de fechar...');
            await this.page.waitForTimeout(5000);
            if (this.browser) {
                await this.browser.close();
                console.log('✅ Navegador fechado');
            }
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Função principal
async function main() {
    const bot = new SpiderTVBot();

    // Cliente e meses dos argumentos ou padrão
    const clientId = process.argv[2] || '364572675';
    const months = process.argv[3] || 1;

    console.log(`🕷️ SpiderTV Bot - Renovando cliente ${clientId} por ${months} mês(es)...`);

    const result = await bot.runRenewal(clientId, months);

    if (result.success) {
        console.log('🎉 Renovação concluída com sucesso!');
        console.log('Resultado:', result.data);
    } else {
        console.log('❌ Erro na renovação:', result.error);
    }
}

// Exportar classe para uso como módulo
module.exports = SpiderTVBot;

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}
