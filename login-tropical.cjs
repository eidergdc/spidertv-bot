const { chromium } = require('playwright');

async function loginTropical() {
    console.log('🌴 Fazendo login no TropicalPlayTV...');

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

    // Configurações anti-detecção
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });
    });

    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('🌐 Acessando painel...');
    await page.goto('https://painel.tropicalplaytv.com', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
    });

    console.log('🔑 Fazendo login...');
    const userField = page.locator('input[name="username"]');
    const passField = page.locator('input[name="password"]');

    if (await userField.count() > 0 && await passField.count() > 0) {
        await userField.fill('Eider Goncalves');
        await passField.fill('Goncalves1@');

        const loginBtn = page.locator('button[type="submit"]');
        if (await loginBtn.count() > 0) {
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
                loginBtn.click()
            ]);
            console.log('✅ Login realizado!');
        }
    }

    // Aguardar login
    await page.waitForTimeout(3000);

    console.log('📋 Navegando para clientes...');
    await page.goto('https://painel.tropicalplaytv.com/iptv/clients', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
    });

    console.log('✅ Página de clientes carregada!');

    // Buscar cliente
    console.log('🔍 Buscando cliente 648718886...');
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.count() > 0) {
        await searchInput.fill('648718886');
        await searchInput.press('Enter');
        console.log('✅ Código inserido no campo de busca e pesquisa executada.');
    }

    // Aguardar resultados
    await page.waitForTimeout(5000);

    // Clicar no botão de calendário
    console.log('📅 Clicando no botão de renovação...');
    const calendarBtn = page.locator('i.fad.fa-calendar-alt');
    if (await calendarBtn.count() > 0) {
        await calendarBtn.click();
        console.log('✅ Modal de renovação aberto.');
    } else {
        console.log('❌ Botão de calendário não encontrado.');
    }

    // Aguardar modal
    await page.waitForTimeout(5000);

    // Verificar se o modal apareceu
    const modal = page.locator('.bootbox.modal');
    if (await modal.count() > 0) {
        console.log('🔄 Modal encontrado. Configurando renovação de 1 mês...');

        // Garantir que o campo de meses está com 1
        const monthsInput = page.locator('#months');
        if (await monthsInput.count() > 0) {
            await monthsInput.fill('1');
            console.log('✅ Quantidade de meses definida para 1.');
        }

        // Clicar no botão confirmar
        const confirmBtn = page.locator('.btn-info.btnrenewplus');
        if (await confirmBtn.count() > 0) {
            await confirmBtn.click();
            console.log('✅ Renovação confirmada!');
        }
    } else {
        console.log('❌ Modal de renovação não encontrado.');
    }

    console.log('👀 Navegador aberto. Renovação concluída ou você pode verificar manualmente.');

    // Manter aberto por muito tempo
    await page.waitForTimeout(300000); // 5 minutos

    await browser.close();
    console.log('🏁 Finalizado');
}

loginTropical().catch(console.error);
