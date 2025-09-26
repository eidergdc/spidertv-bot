/**
 * Identificar Posição da Opção Semestral - Servidor 2 (SpiderTV)
 * 
 * Abre o dropdown e lista todas as opções com suas posições
 * para identificar exatamente onde está "PLANO COMPLETO - SEMESTRAL"
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
        case 'search': prefix = '🔍'; break;
        default: prefix = '📝'; break;
    }
    
    console.log(`[${timestamp}] 🕷️ SpiderTV ${prefix} ${mensagem}`);
}

async function identificarPosicaoSemestral(clienteId) {
    console.log('🔍 IDENTIFICAR POSIÇÃO DA OPÇÃO SEMESTRAL');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📋 Objetivo: Mapear todas as opções do dropdown`);
    console.log('='.repeat(60));
    
    let browser;
    let page;
    
    try {
        // Lançar navegador
        log('Lançando navegador...', 'search');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });
        
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 720 });
        
        // Login rápido
        log('Fazendo login...', 'search');
        await page.goto('https://spidertv.sigma.st/#/sign-in', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(2000);
        
        const userField = await page.$('input[type="text"], input[type="email"]');
        const passField = await page.$('input[type="password"]');
        
        if (userField && passField) {
            await userField.click();
            await userField.type('tropicalplay', { delay: 50 });
            await sleep(200);
            
            await passField.click();
            await passField.type('Virginia13', { delay: 50 });
            await sleep(200);
            
            const loginBtn = await page.$('button[type="submit"]');
            if (loginBtn) {
                await loginBtn.click();
                await sleep(4000);
                log('Login realizado!', 'success');
            }
        }
        
        // Navegar para clientes
        log('Navegando para página de clientes...', 'search');
        await page.goto('https://spidertv.sigma.st/#/customers', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        await sleep(3000);
        
        // Buscar cliente
        log(`Buscando cliente ${clienteId}...`, 'search');
        const searchField = await page.$('input[placeholder*="Pesquisar"], input[type="search"]');
        if (searchField) {
            await searchField.click({ clickCount: 3 });
            await page.keyboard.press('Delete');
            await searchField.type(clienteId, { delay: 50 });
            await page.keyboard.press('Enter');
            await sleep(4000);
        }
        
        // Procurar cliente na tabela
        log('Procurando cliente na tabela...', 'search');
        const cells = await page.$$('td');
        let clienteFound = false;
        
        for (const cell of cells) {
            const text = await page.evaluate(el => el.textContent, cell);
            if (text && text.includes(clienteId)) {
                log(`Cliente encontrado: ${text}`, 'success');
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
        log('Procurando botão de renovação...', 'search');
        let renewBtn = await page.$('button.btn.btn-icon.btn-bg-light.btn-warning.btn-sm');
        if (!renewBtn) {
            const iconBtn = await page.$('i.fa-calendar-plus');
            if (iconBtn) {
                renewBtn = await page.evaluateHandle(icon => icon.closest('button'), iconBtn);
            }
        }
        
        if (renewBtn) {
            log('Clicando no botão de renovação...', 'search');
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
            
            // Abrir dropdown
            log('Abrindo dropdown...', 'search');
            const packageDropdown = await page.$('[data-test="package_id"]');
            if (packageDropdown) {
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
                
                // MAPEAR TODAS AS OPÇÕES
                log('🔍 MAPEANDO TODAS AS OPÇÕES DO DROPDOWN:', 'search');
                
                const opcoes = await page.evaluate(() => {
                    const options = document.querySelectorAll('.el-select-dropdown__item');
                    return Array.from(options).map((option, index) => ({
                        posicao: index,
                        texto: option.textContent?.trim() || '',
                        className: option.className,
                        visible: option.offsetParent !== null,
                        outerHTML: option.outerHTML.substring(0, 150) + '...'
                    })).filter(opt => opt.visible && opt.texto.length > 0);
                });
                
                console.log('\n📋 LISTA COMPLETA DE OPÇÕES:');
                console.log('='.repeat(80));
                
                let posicaoSemestral = -1;
                let posicaoCompleto = -1;
                
                opcoes.forEach((opcao, i) => {
                    const destaque = opcao.texto.includes('SEMESTRAL') ? ' 🎯 ESTA É A OPÇÃO DE 6 MESES!' : '';
                    const completoDestaque = opcao.texto === 'PLANO COMPLETO' ? ' ⚠️ ESTA É A QUE FOI SELECIONADA ERRADA!' : '';
                    
                    console.log(`${i}. [Posição ${opcao.posicao}] "${opcao.texto}"${destaque}${completoDestaque}`);
                    console.log(`   Classe: ${opcao.className}`);
                    
                    if (opcao.texto.includes('SEMESTRAL')) {
                        posicaoSemestral = opcao.posicao;
                    }
                    if (opcao.texto === 'PLANO COMPLETO') {
                        posicaoCompleto = opcao.posicao;
                    }
                    console.log('');
                });
                
                console.log('='.repeat(80));
                console.log('📊 RESUMO IMPORTANTE:');
                
                if (posicaoSemestral >= 0) {
                    console.log(`✅ "PLANO COMPLETO - SEMESTRAL" encontrado na posição: ${posicaoSemestral}`);
                    console.log(`🎯 Para selecionar: usar ${posicaoSemestral} vezes ArrowDown + Enter`);
                } else {
                    console.log('❌ "PLANO COMPLETO - SEMESTRAL" NÃO encontrado!');
                }
                
                if (posicaoCompleto >= 0) {
                    console.log(`⚠️ "PLANO COMPLETO" (incorreto) está na posição: ${posicaoCompleto}`);
                    console.log(`❌ O bot selecionou esta posição por engano`);
                }
                
                const diferenca = posicaoSemestral - posicaoCompleto;
                if (posicaoSemestral >= 0 && posicaoCompleto >= 0) {
                    console.log(`📏 Diferença entre as posições: ${diferenca} posições`);
                    console.log(`🔧 Correção necessária: usar ${posicaoSemestral} ArrowDown em vez de ${posicaoCompleto}`);
                }
                
                console.log('='.repeat(80));
                
                // Manter navegador aberto para análise
                log('Mantendo navegador aberto por 45 segundos para análise...', 'search');
                await sleep(45000);
                
            } else {
                log('❌ Dropdown não encontrado', 'error');
            }
            
        } else {
            throw new Error('Botão de renovação não encontrado');
        }
        
    } catch (error) {
        log(`Erro: ${error.message}`, 'error');
    } finally {
        if (browser) {
            log('Fechando navegador...', 'search');
            await browser.close();
            log('Navegador fechado');
        }
        
        console.log('\n🏁 IDENTIFICAÇÃO FINALIZADA!');
    }
}

// Validação de argumentos
const clienteId = process.argv[2] || '359503850';

// Executar identificação
identificarPosicaoSemestral(clienteId).catch(console.error);
