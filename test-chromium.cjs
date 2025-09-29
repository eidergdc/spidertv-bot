const puppeteer = require('puppeteer');

async function test() {
    console.log('Testando Chromium com Chrome do sistema...');
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://www.google.com');
    console.log('Chrome aberto, visite https://www.google.com');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
    console.log('Teste concluído');
}

test().catch(console.error);
