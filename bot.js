const puppeteer = require('puppeteer');
const axios = require('axios');

class ClientRenewalBot {
    constructor() {
        this.baseUrl = 'https://painel.tropicalplaytv.com';
        this.username = 'administrador';
        this.password = '@Administrador10';
        this.browser = null;
        this.page = null;
        this.cookies = null;
    }

    async initialize() {
        this.browser = await puppeteer.launch({
            headless: false, // Para debug, pode mudar para true em produção
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    }

    async login() {
        try {
            console.log('🔐 Fazendo login...');
            await this.page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });

            // Preencher formulário de login
            await this.page.type('input[name="username"]', this.username);
            await this.page.type('input[name="password"]', this.password);

            // Clicar no botão de login
            await this.page.click('button[type="submit"], input[type="submit"]');

            // Aguardar redirecionamento para dashboard
            await this.page.waitForNavigation({ waitUntil: 'networkidle2' });

            // Verificar se login foi bem-sucedido
            const currentUrl = this.page.url();
            if (currentUrl.includes('/dashboard')) {
                console.log('✅ Login realizado com sucesso!');

                // Salvar cookies para usar na API
                this.cookies = await this.page.cookies();
                return true;
            } else {
                console.log('❌ Falha no login');
                return false;
            }
        } catch (error) {
            console.error('Erro durante login:', error.message);
            return false;
        }
    }

    async navigateToClients() {
        try {
            console.log('📋 Navegando para página de clientes...');
            await this.page.goto(`${this.baseUrl}/iptv/clients`, { waitUntil: 'networkidle2' });
            console.log('✅ Página de clientes carregada!');
            return true;
        } catch (error) {
            console.error('Erro ao navegar para clientes:', error.message);
            return false;
        }
    }

    async renewClient(clientId, months = 1) {
        try {
            console.log(`🔄 Renovando cliente ${clientId} por ${months} mês(es)...`);

            // Preparar headers com cookies
            const cookieString = this.cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
            const headers = {
                'Cookie': cookieString,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': `${this.baseUrl}/iptv/clients`,
                'X-Requested-With': 'XMLHttpRequest'
            };

            // Fazer requisição para renovar cliente
            const response = await axios.get(
                `${this.baseUrl}/sys/api.php?action=renew_client_plus&client_id=${clientId}&months=${months}`,
                { headers }
            );

            if (response.status === 200) {
                console.log('✅ Cliente renovado com sucesso!');
                console.log('Resposta da API:', response.data);
                return { success: true, data: response.data };
            } else {
                console.log('❌ Erro ao renovar cliente:', response.status);
                return { success: false, error: response.status };
            }
        } catch (error) {
            console.error('Erro ao renovar cliente:', error.message);
            return { success: false, error: error.message };
        }
    }

    async getClients(searchTerm = '') {
        try {
            console.log('📋 Buscando clientes...');

            const cookieString = this.cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
            const headers = {
                'Cookie': cookieString,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': `${this.baseUrl}/iptv/clients`,
                'X-Requested-With': 'XMLHttpRequest'
            };

            const params = new URLSearchParams({
                action: 'get_clients',
                draw: 1,
                'columns[0][data]': 'id',
                'columns[0][name]': '',
                'columns[0][searchable]': true,
                'columns[0][orderable]': true,
                'columns[0][search][value]': '',
                'columns[0][search][regex]': false,
                'columns[1][data]': 'display_username',
                'columns[1][name]': '',
                'columns[1][searchable]': true,
                'columns[1][orderable]': true,
                'columns[1][search][value]': '',
                'columns[1][search][regex]': false,
                'columns[2][data]': 'password',
                'columns[2][name]': '',
                'columns[2][searchable]': true,
                'columns[2][orderable]': true,
                'columns[2][search][value]': '',
                'columns[2][search][regex]': false,
                'columns[3][data]': 'email',
                'columns[3][name]': '',
                'columns[3][searchable]': true,
                'columns[3][orderable]': true,
                'columns[3][search][value]': '',
                'columns[3][search][regex]': false,
                'columns[4][data]': 'created_at',
                'columns[4][name]': '',
                'columns[4][searchable]': true,
                'columns[4][orderable]': true,
                'columns[4][search][value]': '',
                'columns[4][search][regex]': false,
                'columns[5][data]': 'exp_date',
                'columns[5][name]': '',
                'columns[5][searchable]': true,
                'columns[5][orderable]': true,
                'columns[5][search][value]': '',
                'columns[5][search][regex]': false,
                'columns[6][data]': 'reseller_name',
                'columns[6][name]': '',
                'columns[6][searchable]': true,
                'columns[6][orderable]': true,
                'columns[6][search][value]': '',
                'columns[6][search][regex]': false,
                'columns[7][data]': 'max_connections',
                'columns[7][name]': '',
                'columns[7][searchable]': true,
                'columns[7][orderable]': true,
                'columns[7][search][value]': '',
                'columns[7][search][regex]': false,
                'columns[8][data]': 'reseller_notes',
                'columns[8][name]': '',
                'columns[8][searchable]': true,
                'columns[8][orderable]': true,
                'columns[8][search][value]': '',
                'columns[8][search][regex]': false,
                'columns[9][data]': 'status',
                'columns[9][name]': '',
                'columns[9][searchable]': true,
                'columns[9][orderable]': true,
                'columns[9][search][value]': '',
                'columns[9][search][regex]': false,
                'columns[10][data]': 'action',
                'columns[10][name]': '',
                'columns[10][searchable]': true,
                'columns[10][orderable]': true,
                'columns[10][search][value]': '',
                'columns[10][search][regex]': false,
                'order[0][column]': 0,
                'order[0][dir]': 'desc',
                start: 0,
                length: 100,
                'search[value]': searchTerm,
                'search[regex]': false,
                _: Date.now()
            });

            const response = await axios.get(
                `${this.baseUrl}/sys/api.php?${params.toString()}`,
                { headers }
            );

            if (response.status === 200) {
                console.log('✅ Lista de clientes obtida!');
                return { success: true, data: response.data };
            } else {
                console.log('❌ Erro ao buscar clientes:', response.status);
                return { success: false, error: response.status };
            }
        } catch (error) {
            console.error('Erro ao buscar clientes:', error.message);
            return { success: false, error: error.message };
        }
    }

    async runRenewal(clientId, months = 1) {
        try {
            console.log('🚀 Iniciando processo de renovação...');

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
            console.error('Erro no processo de renovação:', error.message);
            return { success: false, error: error.message };
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Função principal para uso direto
async function main() {
    const bot = new ClientRenewalBot();

    // Exemplo de uso
    const clientId = process.argv[2] || '648718886'; // ID do cliente como argumento
    const months = process.argv[3] || 1; // Meses como argumento

    console.log(`🔄 Renovando cliente ${clientId} por ${months} mês(es)...`);

    const result = await bot.runRenewal(clientId, months);

    if (result.success) {
        console.log('✅ Renovação concluída com sucesso!');
        console.log('Resultado:', result.data);
    } else {
        console.log('❌ Erro na renovação:', result.error);
    }

    await bot.close();
}

// Exportar classe para uso como módulo
module.exports = ClientRenewalBot;

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}
