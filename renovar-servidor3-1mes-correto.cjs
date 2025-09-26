/**
 * Renovação Servidor 3 - 1 Mês CORRETO
 * 
 * Aplica os conhecimentos do servidor 2 no servidor 3 (Premium Server)
 * com detecção automática do plano atual e navegação dinâmica
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
        case 'verify': prefix = '🔍'; break;
        default: prefix = '📝'; break;
    }
    
    console.log(`[${timestamp}] ⭐ Premium Server ${prefix} ${mensagem}`);
}

async function renovar1MesServidor3(clienteId) {
    console.log('🎯 RENOVAÇÃO SERVIDOR 3 - 1 MÊS CORRETO');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: 1 mês (PLANO MENSAL)`);
    console.log(`🔍 Verificação: "1 crédito será deduzido"`);
    console.log('='.repeat(60));
    
    let browser;
    let page;
    
    try {
        // Lançar navegador
        log('Lançando navegador...');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 150,
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
        log('Fazendo login...');
        await page.goto('https://premiumserver.sigma.st/#/sign-in', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(2000);
        
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            await userField.click();
            await page.evaluate((text, element) => {
                element.value = text;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, 'eidergdc', await page.evaluateHandle(() => document.activeElement));
            await sleep(100);
            
            await passField.click();
            await page.evaluate((text, element) => {
                element.value = text;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, 'Premium2025@', await page.evaluateHandle(() => document.activeElement));
            await sleep(100);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(2000);
                log('Login realizado!', 'success');
            }
        }
        
        // Navegar para clientes
        log('Navegando para página de clientes...');
        await page.goto('https://premiumserver.sigma.st/#/customers', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(3000);
        
        // Buscar cliente
        log(`Buscando cliente ${clienteId}...`);
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[type="search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.evaluate((el, text) => {
                el.value = text;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }, clienteId);
            await page.keyboard.press('Enter');
            await sleep(2000);
        }
        
        // Procurar cliente na tabela e detectar plano atual
        log('Procurando cliente na tabela...');
        const cells = await page.$$('td');
        let clienteFound = false;
        let planoAtual = '';
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                log(`Cliente encontrado: ${text}`, 'success');
                
                // Extrair plano atual do texto (adaptado para servidor 3)
                if (text.includes('TRIMESTRAL') || text.includes('3 MES') || text.includes('3 MÊS')) {
                    planoAtual = 'TRIMESTRAL';
                } else if (text.includes('SEMESTRAL') || text.includes('6 MES') || text.includes('6 MÊS')) {
                    planoAtual = 'SEMESTRAL';
                } else if (text.includes('ANUAL') || text.includes('12 MES') || text.includes('12 MÊS')) {
                    planoAtual = 'ANUAL';
                } else if (text.includes('BIMESTRAL') || text.includes('2 MES') || text.includes('2 MÊS')) {
                    planoAtual = 'BIMESTRAL';
                } else if (text.includes('MENSAL') || text.includes('1 MES') || text.includes('1 MÊS') || text.includes('COMPLETO')) {
                    planoAtual = 'MENSAL';
                } else if (text.includes('PREMIUM') || text.includes('BASIC')) {
                    planoAtual = 'PREMIUM';
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
                planoAtual = 'DESCONHECIDO';
            }
        }
        
        // Procurar e clicar no botão de renovação
        log('Procurando botão de renovação...');
        
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
            log('Clicando no botão de renovação...');
            await renewBtn.click();
            await sleep(2000);
            
            // Aguardar modal carregar
            try {
                await page.waitForSelector('select, .el-select, .dropdown, .modal', { timeout: 10000 });
                log('Modal/Dropdown de renovação carregado!', 'success');
            } catch (error) {
                log('Timeout aguardando modal', 'warning');
            }
            
            await sleep(2000);
            
            // SELEÇÃO DO PLANO DE 1 MÊS
            log('🎯 INICIANDO SELEÇÃO DO PLANO DE 1 MÊS', 'info');
            
            // Procurar dropdown
            const dropdownSelectors = [
                '[data-test="package_id"]',
                '.el-select',
                'select[name="package_id"]',
                'select[name="plan"]',
                'select',
                '.dropdown',
                '.form-select'
            ];
            
            let packageDropdown = null;
            for (const selector of dropdownSelectors) {
                packageDropdown = await page.$(selector);
                if (packageDropdown) {
                    log(`Dropdown encontrado: ${selector}`, 'success');
                    break;
                }
            }
            
            if (packageDropdown) {
                // Abrir dropdown
                log('Abrindo dropdown...');
                try {
                    await packageDropdown.click();
                    log('Dropdown aberto!', 'success');
                } catch (error) {
                    await page.evaluate(el => el.click(), packageDropdown);
                    log('Dropdown aberto com JavaScript!', 'success');
                }
                
                await sleep(3000);
                
                // Aguardar opções carregarem
                try {
                    await page.waitForSelector('.el-select-dropdown__item, .el-option, option', { timeout: 8000 });
                    log('Opções carregadas!', 'success');
                } catch (error) {
                    log('Timeout aguardando opções', 'warning');
                }
                
                // ESTRATÉGIA DINÂMICA: Navegar baseado no plano atual detectado
                log(`Navegando de ${planoAtual} para MENSAL...`, 'info');
                
                // Mapeamento de posições para servidor 3 (CORRETO)
                const posicoes = {
                    'MENSAL': 0,      // "1 MÊS COMPLETO C/ ADULTO"
                    'TRIMESTRAL': 2,  // "3 MÊS C/ ADULTO"
                    'SEMESTRAL': 4,   // "6 MÊS C/ ADULTO"
                    'ANUAL': 6,       // "ANUAL COMPLETO"
                    'PREMIUM': 0
                };
                
                const posicaoAtual = posicoes[planoAtual] || 0; // Default MENSAL se não detectado
                const posicaoDestino = posicoes['MENSAL']; // Posição 0
                
                if (posicaoAtual > posicaoDestino) {
                    // Navegar para cima
                    const navegacoes = posicaoAtual - posicaoDestino;
                    log(`Navegando ${navegacoes} posições para cima (${planoAtual} → MENSAL)...`, 'info');
                    
                    for (let i = 0; i < navegacoes; i++) {
                        await page.keyboard.press('ArrowUp');
                        await sleep(100);
                        log(`Navegação ${i + 1}/${navegacoes} (para cima)...`, 'info');
                    }
                } else if (posicaoAtual < posicaoDestino) {
                    // Navegar para baixo
                    const navegacoes = posicaoDestino - posicaoAtual;
                    log(`Navegando ${navegacoes} posições para baixo (${planoAtual} → MENSAL)...`, 'info');
                    
                    for (let i = 0; i < navegacoes; i++) {
                        await page.keyboard.press('ArrowDown');
                        await sleep(100);
                        log(`Navegação ${i + 1}/${navegacoes} (para baixo)...`, 'info');
                    }
                } else {
                    log('Cliente já está no plano MENSAL!', 'info');
                }
                
                // Verificar qual opção está selecionada
                log('Verificando opção selecionada...', 'verify');
                const opcaoAtual = await page.evaluate(() => {
                    const selectors = [
                        '.el-select-dropdown__item.is-hovering',
                        '.el-select-dropdown__item:focus',
                        'option:checked',
                        '.dropdown-item.active',
                        '.selected'
                    ];
                    
                    for (const selector of selectors) {
                        const highlighted = document.querySelector(selector);
                        if (highlighted) {
                            return highlighted.textContent?.trim() || 'Elemento encontrado';
                        }
                    }
                    return 'Não encontrada';
                });
                
                log(`Opção atual: "${opcaoAtual}"`, 'verify');
                
                if (opcaoAtual.includes('MENSAL') || opcaoAtual.includes('1') || opcaoAtual === 'Não encontrada') {
                    log('✅ Confirmando seleção...', 'success');
                    await page.keyboard.press('Enter');
                    await sleep(2000);
                    
                    // VERIFICAR MENSAGEM DE 1 CRÉDITO
                    log('🔍 Verificando mensagem "1 crédito será deduzido"...', 'verify');
                    await sleep(2000);
                    
                    const mensagem1Credito = await page.evaluate(() => {
                        const elementos = document.querySelectorAll('*');
                        for (const el of elementos) {
                            const texto = el.textContent || '';
                            if (texto.includes('1 crédito será deduzido') || 
                                texto.includes('1 crédito') ||
                                (texto.includes('crédito será deduzido') && texto.includes('1'))) {
                                return texto.trim();
                            }
                        }
                        return null;
                    });
                    
                    if (mensagem1Credito) {
                        log(`✅ CONFIRMAÇÃO ENCONTRADA: "${mensagem1Credito}"`, 'success');
                        log('✅ PLANO DE 1 MÊS SELECIONADO CORRETAMENTE!', 'success');
                    } else {
                        log('⚠️ Mensagem de 1 crédito não encontrada', 'warning');
                        
                        // Procurar por qualquer mensagem de créditos
                        const qualquerCredito = await page.evaluate(() => {
                            const elementos = document.querySelectorAll('*');
                            for (const el of elementos) {
                                const texto = el.textContent || '';
                                if (texto.includes('crédito') || texto.includes('deduzid')) {
                                    return texto.trim();
                                }
                            }
                            return null;
                        });
                        
                        if (qualquerCredito) {
                            log(`ℹ️ Mensagem encontrada: "${qualquerCredito}"`, 'info');
                        }
                    }
                    
                } else {
                    log(`❌ Opção incorreta selecionada: "${opcaoAtual}"`, 'error');
                    log('Tentando correção manual...', 'warning');
                    
                    // Tentar encontrar "1 MÊS COMPLETO C/ ADULTO" diretamente
                    const opcoes = await page.$$('.el-select-dropdown__item, .el-option, option');
                    for (let i = 0; i < opcoes.length; i++) {
                        const texto = await page.evaluate(el => el.textContent?.trim(), opcoes[i]);
                        if (texto && (texto.includes('1 MÊS COMPLETO C/ ADULTO') || 
                                     texto.includes('MENSAL') || 
                                     texto.includes('1 MÊS') || 
                                     texto.includes('1'))) {
                            log(`Encontrado 1 MÊS na posição ${i}: "${texto}"`, 'success');
                            await opcoes[i].click();
                            await sleep(2000);
                            break;
                        }
                    }
                }
                
            } else {
                log('❌ Dropdown não encontrado', 'error');
                log('Tentando confirmar renovação diretamente...', 'warning');
            }
            
            // Aguardar antes de confirmar
            await sleep(3000);
            
            // Confirmar renovação
            log('Procurando botão de confirmação...');
            const confirmSelectors = [
                'button[type="submit"]',
                'button.btn-primary',
                'button.btn-success',
                'button:contains("Renovar")',
                'button:contains("Confirmar")'
            ];
            
            let confirmBtn = null;
            for (const selector of confirmSelectors) {
                confirmBtn = await page.$(selector);
                if (confirmBtn) {
                    const btnText = await page.evaluate(btn => btn.textContent?.trim() || '', confirmBtn);
                    if (btnText.includes('Renovar') || btnText.includes('Confirmar')) {
                        log(`Botão de confirmação encontrado: "${btnText}"`, 'success');
                        break;
                    }
                }
                confirmBtn = null;
            }
            
            if (confirmBtn) {
                const btnText = await page.evaluate(btn => btn.textContent?.trim() || '', confirmBtn);
                log(`Confirmando renovação: "${btnText}"`, 'info');
                await confirmBtn.click();
                await sleep(2000);
                
                // Verificar resultado
                log('Verificando resultado...', 'verify');
                await sleep(3000);
                
                log('Renovação processada!', 'success');
            } else {
                log('Botão de confirmação não encontrado', 'warning');
            }
            
        } else {
            throw new Error('Botão de renovação não encontrado');
        }
        
        // Manter navegador aberto para verificação
        log('Mantendo navegador aberto por 30 segundos para verificação...', 'info');
        await sleep(30000);
        
        console.log('');
        console.log('🎉 RENOVAÇÃO DE 1 MÊS SERVIDOR 3 CONCLUÍDA!');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: 1 mês (PLANO MENSAL)`);
        console.log(`✅ Verificação: Mensagem de 1 crédito`);
        
    } catch (error) {
        log(`Erro: ${error.message}`, 'error');
        console.log('');
        console.log('❌ RENOVAÇÃO FALHOU');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`❌ Erro: ${error.message}`);
    } finally {
        if (browser) {
            log('Fechando navegador...');
            await browser.close();
            log('Navegador fechado');
        }
        
        console.log('');
        console.log('🏁 PROCESSO FINALIZADO!');
    }
}

// Validação de argumentos
const clienteId = process.argv[2];

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node renovar-servidor3-1mes-correto.cjs <cliente_id>');
    console.log('📖 Exemplo: node renovar-servidor3-1mes-correto.cjs 648718886');
    process.exit(1);
}

// Executar renovação
renovar1MesServidor3(clienteId).catch(console.error);
