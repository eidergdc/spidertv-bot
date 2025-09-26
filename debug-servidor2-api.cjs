/**
 * Debug específico para API do Servidor 2 (SpiderTV)
 * Investiga o problema do 403 Forbidden
 */

const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

const SERVIDOR2_CONFIG = {
    nome: 'SpiderTV',
    url: 'https://spidertv.sigma.st',
    apiUrl: 'https://spidertv.sigma.st/api',
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

async function debugServidor2API(clienteId = '359503850') {
    console.log('🔍 DEBUG - SERVIDOR 2 API');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log('=' .repeat(50));
    
    let browser;
    
    try {
        // Lançar navegador
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 300,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        
        // Interceptar todas as requisições para debug
        let authToken = null;
        let allRequests = [];
        
        page.on('request', request => {
            const headers = request.headers();
            const url = request.url();
            
            // Capturar token
            if (headers.authorization && headers.authorization.startsWith('Bearer ')) {
                authToken = headers.authorization.replace('Bearer ', '');
                log(`Token capturado: ${authToken.substring(0, 20)}...`, 'success');
            }
            
            // Log de todas as requisições da API
            if (url.includes('/api/')) {
                allRequests.push({
                    method: request.method(),
                    url: url,
                    headers: headers,
                    postData: request.postData()
                });
                log(`API Request: ${request.method()} ${url}`);
            }
        });
        
        page.on('response', response => {
            const url = response.url();
            if (url.includes('/api/')) {
                log(`API Response: ${response.status()} ${url}`);
            }
        });
        
        // Fazer login
        log('Fazendo login...');
        await page.goto(`${SERVIDOR2_CONFIG.url}/#/sign-in`, { waitUntil: 'networkidle0' });
        await sleep(2000);
        
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            await userField.type(SERVIDOR2_CONFIG.usuario);
            await passField.type(SERVIDOR2_CONFIG.senha);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(3000);
                log('Login realizado!', 'success');
            }
        }
        
        // Navegar para clientes
        log('Navegando para página de clientes...');
        await page.goto(`${SERVIDOR2_CONFIG.url}/#/customers`, { waitUntil: 'networkidle0' });
        await sleep(3000);
        
        // Buscar cliente específico
        log(`Buscando cliente ${clienteId}...`);
        const searchField = await page.$('input[placeholder="Pesquisar"]');
        if (searchField) {
            // Limpar campo usando triple-click + delete
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId);
            await searchField.press('Enter');
            await sleep(4000);
        }
        
        // Aguardar um pouco para capturar requisições
        await sleep(2000);
        
        // Capturar cookies
        const cookies = await page.cookies();
        const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
        
        console.log('\n📋 INFORMAÇÕES CAPTURADAS:');
        console.log('=' .repeat(50));
        console.log(`🔑 Token: ${authToken ? authToken.substring(0, 30) + '...' : 'NÃO CAPTURADO'}`);
        console.log(`🍪 Cookies: ${cookieString.length} caracteres`);
        console.log(`📡 Requisições API: ${allRequests.length}`);
        
        // Mostrar requisições relevantes
        console.log('\n📡 REQUISIÇÕES DA API:');
        allRequests.forEach((req, index) => {
            console.log(`${index + 1}. ${req.method} ${req.url}`);
            if (req.postData) {
                console.log(`   Body: ${req.postData}`);
            }
        });
        
        if (authToken) {
            console.log('\n🧪 TESTANDO ENDPOINTS DA API:');
            console.log('=' .repeat(50));
            
            // Teste 1: Buscar clientes
            log('Testando busca de clientes...');
            try {
                const searchUrl = `${SERVIDOR2_CONFIG.apiUrl}/customers?page=1&username=${clienteId}&serverId=&packageId=&expiryFrom=&expiryTo=&status=&isTrial=&connections=&perPage=20`;
                const searchResponse = await fetch(searchUrl, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Accept': 'application/json',
                        'Cookie': cookieString,
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36'
                    }
                });
                
                log(`Busca de clientes: ${searchResponse.status} ${searchResponse.statusText}`);
                
                if (searchResponse.ok) {
                    const searchData = await searchResponse.json();
                    console.log('📄 Dados da busca:', JSON.stringify(searchData, null, 2));
                    
                    // Tentar extrair customer ID real
                    if (searchData.data && searchData.data.length > 0) {
                        const cliente = searchData.data[0];
                        const realCustomerId = cliente.id || cliente.customer_id || cliente.uuid;
                        log(`Customer ID real encontrado: ${realCustomerId}`, 'success');
                        
                        // Teste 2: Tentar renovação com ID real
                        if (realCustomerId) {
                            log('Testando renovação com customer ID real...');
                            
                            const renewData = { months: 1, plan_id: 1 };
                            const renewResponse = await fetch(`${SERVIDOR2_CONFIG.apiUrl}/customers/${realCustomerId}/renew`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${authToken}`,
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'Cookie': cookieString,
                                    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36',
                                    'Origin': SERVIDOR2_CONFIG.url,
                                    'Referer': `${SERVIDOR2_CONFIG.url}/`
                                },
                                body: JSON.stringify(renewData)
                            });
                            
                            log(`Renovação: ${renewResponse.status} ${renewResponse.statusText}`);
                            
                            if (renewResponse.ok) {
                                const renewResult = await renewResponse.json();
                                console.log('🎉 Renovação bem-sucedida!', JSON.stringify(renewResult, null, 2));
                            } else {
                                const errorText = await renewResponse.text();
                                console.log('❌ Erro na renovação:', errorText);
                            }
                        }
                    } else {
                        log('Nenhum cliente encontrado na busca', 'warning');
                    }
                } else {
                    const errorText = await searchResponse.text();
                    log(`Erro na busca: ${errorText}`, 'error');
                }
                
            } catch (error) {
                log(`Erro no teste da API: ${error.message}`, 'error');
            }
        }
        
        console.log('\n⏳ Mantendo navegador aberto por 30 segundos para análise...');
        await sleep(30000);
        
    } catch (error) {
        log(`Erro geral: ${error.message}`, 'error');
    } finally {
        if (browser) {
            await browser.close();
            log('Navegador fechado');
        }
    }
}

// Executar debug
const clienteId = process.argv[2] || '359503850';
debugServidor2API(clienteId).catch(console.error);
