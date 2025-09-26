/**
 * Teste muito simples - apenas abrir navegador
 */

console.log('🔄 Iniciando teste simples do navegador...');

async function testBrowser() {
    try {
        console.log('📦 Importando Puppeteer...');
        const puppeteer = require('puppeteer');
        console.log('✅ Puppeteer importado com sucesso');
        
        console.log('🚀 Tentando lançar navegador...');
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log('✅ Navegador lançado!');
        
        console.log('📄 Criando nova página...');
        const page = await browser.newPage();
        console.log('✅ Página criada!');
        
        console.log('🌐 Navegando para Google...');
        await page.goto('https://www.google.com');
        console.log('✅ Google carregado!');
        
        console.log('⏳ Aguardando 5 segundos...');
        await page.waitForTimeout(5000);
        
        console.log('🔄 Fechando navegador...');
        await browser.close();
        console.log('✅ Navegador fechado!');
        
        console.log('🎉 Teste concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error('Stack completo:', error.stack);
    }
}

testBrowser();
