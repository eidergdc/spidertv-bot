/**
 * Teste simples com Puppeteer para debug
 */

const puppeteer = require('puppeteer');

console.log('🕷️ Iniciando teste simples com Puppeteer...');

async function testSimple() {
    let browser;
    
    try {
        console.log('🚀 Lançando navegador...');
        browser = await puppeteer.launch({
            headless: false, // Visível
            slowMo: 1000,    // Bem devagar
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        console.log('✅ Navegador lançado');
        
        const page = await browser.newPage();
        console.log('✅ Página criada');
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        console.log('✅ User agent definido');
        
        console.log('🌐 Navegando para SpiderTV...');
        await page.goto('https://spidertv.sigma.st', { waitUntil: 'networkidle2' });
        console.log('✅ Página carregada');
        
        // Aguardar 3 segundos
        console.log('⏳ Aguardando 3 segundos...');
        await page.waitForTimeout(3000);
        
        // Tirar screenshot
        console.log('📸 Tirando screenshot...');
        await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
        console.log('✅ Screenshot salvo: test-screenshot.png');
        
        // Verificar título
        const title = await page.title();
        console.log('📄 Título da página:', title);
        
        // Verificar URL
        const url = page.url();
        console.log('🌐 URL atual:', url);
        
        // Procurar campos de login
        console.log('🔍 Procurando campos de login...');
        
        const emailField = await page.$('input[type="email"]');
        const passwordField = await page.$('input[type="password"]');
        
        console.log('📧 Campo email:', emailField ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
        console.log('🔒 Campo senha:', passwordField ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
        
        if (emailField && passwordField) {
            console.log('✅ Campos de login encontrados!');
            
            // Tentar preencher com dados de teste
            console.log('📝 Preenchendo campos de teste...');
            await emailField.type('teste@exemplo.com');
            await passwordField.type('senha123');
            
            console.log('✅ Campos preenchidos');
            
            // Screenshot com campos preenchidos
            await page.screenshot({ path: 'test-filled.png', fullPage: true });
            console.log('📸 Screenshot com campos preenchidos: test-filled.png');
        }
        
        // Aguardar 10 segundos para inspeção manual
        console.log('👀 Aguardando 10 segundos para inspeção manual...');
        await page.waitForTimeout(10000);
        
        console.log('🎉 Teste concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante teste:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (browser) {
            console.log('🔄 Fechando navegador...');
            await browser.close();
            console.log('✅ Navegador fechado');
        }
    }
}

testSimple();
