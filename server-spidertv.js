/**
 * Servidor HTTP simples para renovação no SpiderTV (Servidor 2)
 */

import 'dotenv/config';
import express from 'express';
import { chromium } from 'playwright';

const app = express();
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 8080;
const SPIDERTV_URL = process.env.SERVER2_URL || 'https://spidertv.sigma.st';
const USERNAME = process.env.SERVER2_USER || '';
const PASSWORD = process.env.SERVER2_PASS || '';

console.log('🕷️ Servidor SpiderTV Bot');
console.log('URL:', SPIDERTV_URL);
console.log('Usuário:', USERNAME);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        server: 'SpiderTV Bot',
        url: SPIDERTV_URL,
        hasCredentials: !!(USERNAME && PASSWORD)
    });
});

// Renovação no SpiderTV
app.post('/activate/spidertv', async (req, res) => {
    try {
        const { code, months = 1 } = req.body || {};
        
        if (!code) {
            return res.status(400).json({ 
                ok: false, 
                error: 'Código do cliente é obrigatório' 
            });
        }

        if (!USERNAME || !PASSWORD) {
            return res.status(500).json({ 
                ok: false, 
                error: 'Credenciais não configuradas no .env' 
            });
        }

        console.log(`🔄 Iniciando renovação - Cliente: ${code}, Meses: ${months}`);

        // Lançar navegador
        console.log('🚀 Lançando navegador...');
        const browser = await chromium.launch({ 
            headless: false, // Visível para você ver
            slowMo: 1000     // Mais devagar
        });
        
        const context = await browser.newContext();
        const page = await context.newPage();

        try {
            // Navegar para SpiderTV
            console.log('🌐 Navegando para SpiderTV...');
            await page.goto(SPIDERTV_URL, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(3000);

            // Fazer login
            console.log('🔐 Fazendo login...');
            
            // Procurar campos de login
            const emailField = await page.$('input[type="email"], input[name="email"]');
            const passwordField = await page.$('input[type="password"]');

            if (emailField && passwordField) {
                await emailField.fill(USERNAME);
                await passwordField.fill(PASSWORD);
                
                // Clicar no botão de login
                const loginButton = await page.$('button[type="submit"], button:has-text("Login")');
                if (loginButton) {
                    await loginButton.click();
                    await page.waitForTimeout(5000);
                    console.log('✅ Login realizado');
                }
            }

            // Procurar página de clientes
            console.log('📋 Procurando página de clientes...');
            
            // Tentar encontrar link de clientes
            const clientsLink = await page.$('a[href*="client"], a[href*="customer"]');
            if (clientsLink) {
                await clientsLink.click();
                await page.waitForTimeout(3000);
                console.log('✅ Página de clientes acessada');
            }

            // Buscar cliente
            console.log(`🔍 Buscando cliente ${code}...`);
            const searchField = await page.$('input[type="search"], input[name="search"]');
            if (searchField) {
                await searchField.fill(code);
                await page.keyboard.press('Enter');
                await page.waitForTimeout(3000);
                console.log('✅ Busca realizada');
            }

            // Procurar botão de renovação
            console.log('🔄 Procurando botão de renovação...');
            const renewButton = await page.$('button:has-text("Renew"), a:has-text("Renew")');
            if (renewButton) {
                await renewButton.click();
                await page.waitForTimeout(2000);
                console.log('✅ Renovação iniciada');
            }

            // Aguardar para visualização
            console.log('👀 Aguardando 10 segundos para visualização...');
            await page.waitForTimeout(10000);

            console.log('🎉 Processo concluído!');

            // Fechar navegador
            await browser.close();

            return res.json({
                ok: true,
                message: `Cliente ${code} processado com sucesso`,
                months: months
            });

        } catch (error) {
            console.error('❌ Erro durante automação:', error.message);
            await browser.close();
            throw error;
        }

    } catch (error) {
        console.error('💥 Erro:', error.message);
        return res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📋 Teste: curl -X POST http://localhost:${PORT}/activate/spidertv -H "Content-Type: application/json" -d '{"code":"364572675","months":1}'`);
});
