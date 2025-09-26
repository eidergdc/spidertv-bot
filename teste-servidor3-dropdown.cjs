/**
 * Teste Dropdown Servidor 3 (Premium Server)
 * 
 * Identifica o dropdown de seleção de planos no servidor 3
 * e mapeia as opções disponíveis
 */

const puppeteer = require('puppeteer');

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
        case 'test': prefix = '🧪'; break;
        default: prefix = '📝'; break;
    }
    
    console.log(`[${timestamp}] ⭐ Premium Server ${prefix} ${mensagem}`);
}

async function testeDropdownServidor3(clienteId) {
    console.log('🧪 TESTE DROPDOWN SERVIDOR 3 (PREMIUM SERVER)');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Objetivo: Identificar dropdown e opções de planos`);
    console.log('='.repeat(60));
    
    let browser;
    let page;
    
    try {
        // Lançar navegador
        log('Lançando navegador...', 'test');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 200,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });
        
        page = await browser.newPage();
        
        // Configurações anti-detecção
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 720 });
        
        // Login
        log('Fazendo login...', 'test');
        await page.goto('https://premiumserver.sigma.st/#/sign-in', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(2000);
        
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            await userField.click();
            await userField.type('eidergdc', { delay: 80 });
            await sleep(300);
            
            await passField.click();
            await passField.type('Premium2025@', { delay: 80 });
            await sleep(300);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(4000);
                log('Login realizado!', 'success');
            }
        }
        
        // Navegar para clientes
        log('Navegando para página de clientes...', 'test');
        await page.goto('https://premiumserver.sigma.st/#/customers', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(3000);
        
        // Buscar cliente
        log(`Buscando cliente ${clienteId}...`, 'test');
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[type="search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId, { delay: 80 });
            await page.keyboard.press('Enter');
            await sleep(4000);
        }
        
        // Procurar cliente na tabela e detectar plano atual
        log('Procurando cliente na tabela...', 'test');
        const cells = await page.$$('td');
        let clienteFound = false;
        let planoAtual = '';
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                log(`Cliente encontrado: ${text}`, 'success');
                
                // Extrair plano atual do texto
                if (text.includes('TRIMESTRAL')) {
                    planoAtual = 'TRIMESTRAL';
                } else if (text.includes('SEMESTRAL')) {
                    planoAtual = 'SEMESTRAL';
                } else if (text.includes('ANUAL')) {
                    planoAtual = 'ANUAL';
                } else if (text.includes('BIMESTRAL')) {
                    planoAtual = 'BIMESTRAL';
                } else if (text.includes('MENSAL') || text.includes('MÊS')) {
                    planoAtual = 'MENSAL';
                } else if (text.includes('COMPLETO')) {
                    planoAtual = 'COMPLETO';
                }
                
                log(`Plano atual detectado: ${planoAtual}`, 'info');
                
                const row = await page.evaluateHandle(cell => cell.closest('tr'), cell);
                await row.click();
                await sleep(3000);
                clienteFound = true;
                break;
            }
        }
        
        if (!clienteFound) {
            const firstRow = await page.$('tbody tr:first-child');
            if (firstRow) {
                await firstRow.click();
                await sleep(3000);
                log('Usando primeira linha da tabela', 'warning');
            }
        }
        
        // Procurar e clicar no botão de renovação
        log('Procurando botão de renovação...', 'test');
        
        // Seletores específicos para servidor 3
        const renewSelectors = [
            'i.fad.fa-calendar-plus.text-white',
            'i.fa-calendar-plus',
            'i[class*="calendar-plus"]',
            'button[title*="Renovar"]',
            'button[title*="Renew"]'
        ];
        
        let renewBtn = null;
        for (const selector of renewSelectors) {
            const element = await page.$(selector);
            if (element) {
                log(`Botão de renovação encontrado: ${selector}`, 'success');
                renewBtn = await page.evaluateHandle(el => el.closest('button') || el.parentElement, element);
                break;
            }
        }
        
        if (renewBtn) {
            log('Clicando no botão de renovação...', 'test');
            await renewBtn.click();
            await sleep(4000);
            
            // CAPTURAR INFORMAÇÕES DO DROPDOWN
            log('🔍 CAPTURANDO INFORMAÇÕES DO DROPDOWN', 'test');
            
            // Procurar por diferentes tipos de dropdown
            const dropdownSelectors = [
                '[data-test="package_id"]',
                '.el-select',
                'select[name="package_id"]',
                'select[name="plan"]',
                'select',
                '.dropdown',
                '.form-select'
            ];
            
            let dropdown = null;
            let dropdownType = '';
            
            for (const selector of dropdownSelectors) {
                dropdown = await page.$(selector);
                if (dropdown) {
                    dropdownType = selector;
                    log(`Dropdown encontrado: ${selector}`, 'success');
                    break;
                }
            }
            
            if (dropdown) {
                // Tentar abrir o dropdown
                log('Tentando abrir dropdown...', 'test');
                try {
                    await dropdown.click();
                    await sleep(2000);
                    log('Dropdown aberto!', 'success');
                } catch (error) {
                    log('Erro ao abrir dropdown, tentando JavaScript...', 'warning');
                    await page.evaluate(el => el.click(), dropdown);
                    await sleep(2000);
                }
                
                // Capturar opções disponíveis
                log('Capturando opções do dropdown...', 'test');
                
                const opcoes = await page.evaluate(() => {
                    // Procurar por diferentes tipos de opções
                    const selectors = [
                        '.el-select-dropdown__item',
                        '.el-option',
                        'option',
                        '.dropdown-item',
                        '.dropdown-menu li',
                        '.dropdown-menu a'
                    ];
                    
                    let allOptions = [];
                    
                    for (const selector of selectors) {
                        const options = document.querySelectorAll(selector);
                        if (options.length > 0) {
                            allOptions = Array.from(options).map((option, index) => ({
                                index,
                                selector,
                                text: option.textContent?.trim() || '',
                                value: option.getAttribute('data-value') || option.value || '',
                                className: option.className,
                                visible: option.offsetParent !== null,
                                outerHTML: option.outerHTML.substring(0, 200) + '...'
                            })).filter(opt => opt.visible && opt.text.length > 0);
                            
                            if (allOptions.length > 0) break;
                        }
                    }
                    
                    return allOptions;
                });
                
                if (opcoes.length > 0) {
                    log(`Encontradas ${opcoes.length} opções no dropdown:`, 'success');
                    console.log('\n📋 OPÇÕES DISPONÍVEIS:');
                    opcoes.forEach((opcao, i) => {
                        console.log(`\n${i + 1}. "${opcao.text}"`);
                        console.log(`   Valor: "${opcao.value}"`);
                        console.log(`   Seletor: ${opcao.selector}`);
                        console.log(`   Classe: ${opcao.className}`);
                        console.log(`   HTML: ${opcao.outerHTML}`);
                    });
                    
                    // Procurar por padrões de meses
                    console.log('\n🔢 ANÁLISE DE PADRÕES:');
                    opcoes.forEach((opcao, i) => {
                        const text = opcao.text.toLowerCase();
                        if (text.includes('1') || text.includes('mensal') || text.includes('mês')) {
                            console.log(`   Posição ${i}: POSSÍVEL 1 MÊS - "${opcao.text}"`);
                        }
                        if (text.includes('3') || text.includes('trimestral') || text.includes('trimestre')) {
                            console.log(`   Posição ${i}: POSSÍVEL 3 MESES - "${opcao.text}"`);
                        }
                        if (text.includes('6') || text.includes('semestral') || text.includes('semestre')) {
                            console.log(`   Posição ${i}: POSSÍVEL 6 MESES - "${opcao.text}"`);
                        }
                        if (text.includes('12') || text.includes('anual') || text.includes('ano')) {
                            console.log(`   Posição ${i}: POSSÍVEL 12 MESES - "${opcao.text}"`);
                        }
                    });
                    
                } else {
                    log('Nenhuma opção encontrada no dropdown', 'warning');
                    
                    // Tentar capturar qualquer elemento que possa ser uma opção
                    const elementosGerais = await page.evaluate(() => {
                        const elementos = document.querySelectorAll('*');
                        const possiveisOpcoes = [];
                        
                        for (const el of elementos) {
                            const texto = el.textContent?.trim() || '';
                            if (texto.length > 0 && texto.length < 100 && 
                                (texto.includes('MÊS') || texto.includes('PLANO') || 
                                 texto.includes('COMPLETO') || texto.includes('PREMIUM'))) {
                                possiveisOpcoes.push({
                                    text: texto,
                                    tagName: el.tagName,
                                    className: el.className,
                                    id: el.id
                                });
                            }
                        }
                        
                        return possiveisOpcoes.slice(0, 20); // Limitar a 20 resultados
                    });
                    
                    if (elementosGerais.length > 0) {
                        console.log('\n🔍 ELEMENTOS RELACIONADOS A PLANOS:');
                        elementosGerais.forEach((el, i) => {
                            console.log(`${i + 1}. "${el.text}" (${el.tagName})`);
                        });
                    }
                }
                
            } else {
                log('Dropdown não encontrado', 'warning');
                
                // Listar todos os elementos select e dropdown da página
                const todosDropdowns = await page.evaluate(() => {
                    const selects = document.querySelectorAll('select, .dropdown, .el-select, [class*="select"]');
                    return Array.from(selects).map(el => ({
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        name: el.name,
                        outerHTML: el.outerHTML.substring(0, 150) + '...'
                    }));
                });
                
                if (todosDropdowns.length > 0) {
                    console.log('\n📋 TODOS OS DROPDOWNS/SELECTS ENCONTRADOS:');
                    todosDropdowns.forEach((dropdown, i) => {
                        console.log(`\n${i + 1}. ${dropdown.tagName}`);
                        console.log(`   Classe: ${dropdown.className}`);
                        console.log(`   ID: ${dropdown.id}`);
                        console.log(`   Name: ${dropdown.name}`);
                        console.log(`   HTML: ${dropdown.outerHTML}`);
                    });
                }
            }
            
        } else {
            log('Botão de renovação não encontrado', 'error');
        }
        
        // Manter navegador aberto para análise
        log('Mantendo navegador aberto por 60 segundos para análise...', 'test');
        await sleep(60000);
        
    } catch (error) {
        log(`Erro no teste: ${error.message}`, 'error');
    } finally {
        if (browser) {
            log('Fechando navegador...', 'test');
            await browser.close();
            log('Navegador fechado');
        }
        
        console.log('\n🏁 TESTE DROPDOWN SERVIDOR 3 FINALIZADO!');
    }
}

// Validação de argumentos
const clienteId = process.argv[2];

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node teste-servidor3-dropdown.cjs <cliente_id>');
    console.log('📖 Exemplo: node teste-servidor3-dropdown.cjs 648718886');
    process.exit(1);
}

// Executar teste
testeDropdownServidor3(clienteId).catch(console.error);
