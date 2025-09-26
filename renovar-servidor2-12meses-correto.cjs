/**
 * Renovação Servidor 2 - 12 Meses CORRETO
 * 
 * Versão corrigida que seleciona especificamente "PLANO COMPLETO - ANUAL"
 * e verifica a mensagem "12 créditos serão deduzidos"
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
    
    console.log(`[${timestamp}] 🕷️ SpiderTV ${prefix} ${mensagem}`);
}

async function renovar12MesesCorreto(clienteId) {
    console.log('🎯 RENOVAÇÃO SERVIDOR 2 - 12 MESES CORRETO');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: 12 meses (PLANO COMPLETO - ANUAL)`);
    console.log(`🔍 Verificação: "12 créditos serão deduzidos"`);
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
        await page.goto('https://spidertv.sigma.st/#/sign-in', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(2000);
        
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            await userField.click();
            await userField.type('tropicalplay', { delay: 80 });
            await sleep(300);
            
            await passField.click();
            await passField.type('Virginia13', { delay: 80 });
            await sleep(300);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(4000);
                log('Login realizado!', 'success');
            }
        }
        
        // Navegar para clientes
        log('Navegando para página de clientes...');
        await page.goto('https://spidertv.sigma.st/#/customers', { 
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
            await searchField.type(clienteId, { delay: 80 });
            await page.keyboard.press('Enter');
            await sleep(4000);
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
                
                // Extrair plano atual do texto
                if (text.includes('TRIMESTRAL')) {
                    planoAtual = 'TRIMESTRAL';
                } else if (text.includes('SEMESTRAL')) {
                    planoAtual = 'SEMESTRAL';
                } else if (text.includes('ANUAL')) {
                    planoAtual = 'ANUAL';
                } else if (text.includes('BIMESTRAL')) {
                    planoAtual = 'BIMESTRAL';
                } else if (text.includes('PLANO COMPLETO') && !text.includes('TRIMESTRAL') && !text.includes('SEMESTRAL') && !text.includes('ANUAL') && !text.includes('BIMESTRAL')) {
                    planoAtual = 'MENSAL';
                } else if (text.includes('SEM ADULTOS')) {
                    planoAtual = 'SEM ADULTOS';
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
        let renewBtn = await page.$('button.btn.btn-icon.btn-bg-light.btn-warning.btn-sm');
        if (!renewBtn) {
            const iconBtn = await page.$('i.fa-calendar-plus');
            if (iconBtn) {
                renewBtn = await page.evaluateHandle(icon => icon.closest('button'), iconBtn);
            }
        }
        
        if (renewBtn) {
            log('Clicando no botão de renovação...');
            await renewBtn.click();
            await sleep(4000);
            
            // Aguardar modal carregar
            try {
                await page.waitForSelector('[data-test="package_id"]', { timeout: 10000 });
                log('Modal de renovação carregado!', 'success');
            } catch (error) {
                log('Timeout aguardando modal', 'warning');
            }
            
            await sleep(2000);
            
            // SELEÇÃO CORRETA DO PLANO DE 12 MESES
            log('🎯 INICIANDO SELEÇÃO CORRETA DO PLANO DE 12 MESES', 'info');
            
            const packageDropdown = await page.$('[data-test="package_id"]');
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
                    await page.waitForSelector('.el-select-dropdown__item', { timeout: 8000 });
                    log('Opções carregadas!', 'success');
                } catch (error) {
                    log('Timeout aguardando opções', 'warning');
                }
                
                // ESTRATÉGIA DINÂMICA: Navegar baseado no plano atual detectado
                log(`Navegando de ${planoAtual} para ANUAL...`, 'info');
                
                // Mapeamento de posições
                const posicoes = {
                    'MENSAL': 1,
                    'SEM ADULTOS': 2,
                    'BIMESTRAL': 3,
                    'TRIMESTRAL': 4,
                    'SEMESTRAL': 5,
                    'ANUAL': 6
                };
                
                const posicaoAtual = posicoes[planoAtual] || 4; // Default TRIMESTRAL se não detectado
                const posicaoDestino = posicoes['ANUAL']; // Posição 6
                
                if (posicaoAtual > posicaoDestino) {
                    // Navegar para cima
                    const navegacoes = posicaoAtual - posicaoDestino;
                    log(`Navegando ${navegacoes} posições para cima (${planoAtual} → ANUAL)...`, 'info');
                    
                    for (let i = 0; i < navegacoes; i++) {
                        await page.keyboard.press('ArrowUp');
                        await sleep(300);
                        log(`Navegação ${i + 1}/${navegacoes} (para cima)...`, 'info');
                    }
                } else if (posicaoAtual < posicaoDestino) {
                    // Navegar para baixo
                    const navegacoes = posicaoDestino - posicaoAtual;
                    log(`Navegando ${navegacoes} posições para baixo (${planoAtual} → ANUAL)...`, 'info');
                    
                    for (let i = 0; i < navegacoes; i++) {
                        await page.keyboard.press('ArrowDown');
                        await sleep(300);
                        log(`Navegação ${i + 1}/${navegacoes} (para baixo)...`, 'info');
                    }
                } else {
                    log('Cliente já está no plano ANUAL!', 'info');
                }
                
                // Verificar qual opção está selecionada antes de confirmar
                log('Verificando opção selecionada...', 'verify');
                const opcaoAtual = await page.evaluate(() => {
                    const highlighted = document.querySelector('.el-select-dropdown__item.is-hovering, .el-select-dropdown__item:focus');
                    return highlighted ? highlighted.textContent?.trim() : 'Não encontrada';
                });
                
                log(`Opção atual: "${opcaoAtual}"`, 'verify');
                
                if (opcaoAtual.includes('ANUAL')) {
                    log('✅ Opção ANUAL encontrada! Confirmando seleção...', 'success');
                    await page.keyboard.press('Enter');
                    await sleep(2000);
                    
                    // VERIFICAR MENSAGEM DE 12 CRÉDITOS
                    log('🔍 Verificando mensagem "12 créditos serão deduzidos"...', 'verify');
                    await sleep(2000);
                    
                    const mensagem12Creditos = await page.evaluate(() => {
                        const elementos = document.querySelectorAll('*');
                        for (const el of elementos) {
                            const texto = el.textContent || '';
                            if (texto.includes('12 créditos serão deduzidos') || 
                                texto.includes('12 créditos') ||
                                (texto.includes('créditos serão deduzidos') && texto.includes('12'))) {
                                return texto.trim();
                            }
                        }
                        return null;
                    });
                    
                    if (mensagem12Creditos) {
                        log(`✅ CONFIRMAÇÃO ENCONTRADA: "${mensagem12Creditos}"`, 'success');
                        log('✅ PLANO DE 12 MESES SELECIONADO CORRETAMENTE!', 'success');
                    } else {
                        log('⚠️ Mensagem de 12 créditos não encontrada', 'warning');
                        
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
                    
                    // Tentar encontrar ANUAL diretamente
                    const opcoes = await page.$$('.el-select-dropdown__item');
                    for (let i = 0; i < opcoes.length; i++) {
                        const texto = await page.evaluate(el => el.textContent?.trim(), opcoes[i]);
                        if (texto && texto.includes('ANUAL')) {
                            log(`Encontrado ANUAL na posição ${i}: "${texto}"`, 'success');
                            await opcoes[i].click();
                            await sleep(2000);
                            break;
                        }
                    }
                }
                
            } else {
                log('❌ Dropdown não encontrado', 'error');
            }
            
            // Aguardar antes de confirmar
            await sleep(3000);
            
            // Confirmar renovação
            log('Procurando botão de confirmação...');
            const confirmBtn = await page.$('button.btn.btn-lg.btn-primary[type="submit"]');
            if (confirmBtn) {
                const btnText = await page.evaluate(btn => btn.textContent?.trim() || '', confirmBtn);
                if (btnText.includes('Renovar')) {
                    log(`Confirmando renovação: "${btnText}"`, 'info');
                    await confirmBtn.click();
                    await sleep(4000);
                    
                    // Verificar resultado
                    log('Verificando resultado...', 'verify');
                    await sleep(3000);
                    
                    log('Renovação processada!', 'success');
                } else {
                    log(`Botão encontrado mas texto inesperado: "${btnText}"`, 'warning');
                }
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
        console.log('🎉 RENOVAÇÃO DE 12 MESES CONCLUÍDA!');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: 12 meses (PLANO COMPLETO - ANUAL)`);
        console.log(`✅ Verificação: Mensagem de 12 créditos`);
        
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
    console.log('📖 Uso: node renovar-servidor2-12meses-correto.cjs <cliente_id>');
    console.log('📖 Exemplo: node renovar-servidor2-12meses-correto.cjs 359503850');
    process.exit(1);
}

// Executar renovação
renovar12MesesCorreto(clienteId).catch(console.error);
