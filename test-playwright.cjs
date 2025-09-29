const { chromium } = require('playwright');

async function test() {
    console.log('Testando Playwright com Chromium...');
    const browser = await chromium.launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
        ]
    });
    const page = await browser.newPage();
    await page.goto('https://www.google.com');
    console.log('Chromium aberto, visite https://www.google.com');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
    console.log('Teste concluído');
}

test().catch(console.error);
