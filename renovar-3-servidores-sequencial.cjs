/**
 * Bot Unificado - Renovação nos 3 Servidores (Execução Sequencial)
 * 
 * Executa as renovações sequencialmente usando os scripts individuais testados:
 * - Servidor 1 (TropicalPlayTV): Script individual baseado na implementação funcionando
 * - Servidor 2 (SpiderTV): Script individual testado e corrigido
 * - Servidor 3 (Premium Server): Script individual com posições corretas testadas
 * 
 * Uso: node renovar-3-servidores-sequencial.cjs <cliente_id> <meses>
 * Exemplo: node renovar-3-servidores-sequencial.cjs 648718886 6
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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
        case 'header': prefix = '🎯'; break;
        case 'separator': prefix = '📋'; break;
        default: prefix = '📝'; break;
    }
    
    console.log(`[${timestamp}] ${prefix} ${mensagem}`);
}

// Executar script individual
function executarScript(scriptPath, clienteId, meses = null) {
    return new Promise((resolve) => {
        log(`Executando: ${path.basename(scriptPath)}`, 'info');
        
        const args = meses ? [scriptPath, clienteId, meses] : [scriptPath, clienteId];
        const processo = spawn('node', args, {
            stdio: 'inherit',
            cwd: __dirname
        });
        
        processo.on('close', (code) => {
            if (code === 0) {
                log(`✅ ${path.basename(scriptPath)} concluído com sucesso!`, 'success');
                resolve({ success: true, script: path.basename(scriptPath) });
            } else {
                log(`❌ ${path.basename(scriptPath)} falhou com código ${code}`, 'error');
                resolve({ success: false, script: path.basename(scriptPath), code });
            }
        });
        
        processo.on('error', (error) => {
            log(`❌ Erro ao executar ${path.basename(scriptPath)}: ${error.message}`, 'error');
            resolve({ success: false, script: path.basename(scriptPath), error: error.message });
        });
    });
}

// Verificar se arquivo existe
function arquivoExiste(caminho) {
    try {
        return fs.existsSync(caminho);
    } catch (error) {
        return false;
    }
}

// Função principal
async function renovarTodosServidores(clienteId, meses) {
    console.log('🎯 BOT UNIFICADO - RENOVAÇÃO NOS 3 SERVIDORES (EXECUÇÃO SEQUENCIAL)');
    console.log(`🎯 Cliente: ${clienteId}`);
    console.log(`📅 Período: ${meses} mês(es)`);
    console.log('');
    console.log('📋 Estratégia: Execução sequencial dos scripts individuais testados');
    console.log('🕷️ Servidor 2 (SpiderTV): Script individual corrigido');
    console.log('⭐ Servidor 3 (Premium Server): Script individual com posições corretas');
    console.log('🌴 Servidor 1 (TropicalPlayTV): Script individual (se disponível)');
    console.log('');
    console.log('🚀 INICIANDO RENOVAÇÃO SEQUENCIAL');
    console.log('='.repeat(70));
    
    const resultados = [];
    
    try {
        // Mapear scripts por período
        const scriptsServidor2 = {
            1: './renovar-servidor2-1mes-correto.cjs',
            3: './renovar-servidor2-3meses-correto.cjs',
            6: './renovar-servidor2-6meses-correto.cjs',
            12: './renovar-servidor2-12meses-correto.cjs'
        };
        
        const scriptsServidor3 = {
            1: './renovar-servidor3-1mes-correto.cjs',
            3: './renovar-servidor3-3meses-correto.cjs',
            6: './renovar-servidor3-6meses-correto.cjs',
            12: './renovar-servidor3-12meses-correto.cjs'
        };
        
        // Verificar se os scripts existem
        const scriptServidor2 = scriptsServidor2[meses];
        const scriptServidor3 = scriptsServidor3[meses];
        
        if (!scriptServidor2 || !arquivoExiste(scriptServidor2)) {
            log(`❌ Script do Servidor 2 para ${meses} meses não encontrado: ${scriptServidor2}`, 'error');
            resultados.push({ success: false, servidor: 'SpiderTV', error: 'Script não encontrado' });
        }
        
        if (!scriptServidor3 || !arquivoExiste(scriptServidor3)) {
            log(`❌ Script do Servidor 3 para ${meses} meses não encontrado: ${scriptServidor3}`, 'error');
            resultados.push({ success: false, servidor: 'Premium Server', error: 'Script não encontrado' });
        }
        
        // Usar script unificado do Servidor 1 (TropicalPlayTV)
        const scriptServidor1 = './renovar-servidor1-fluxo-completo.cjs';
        
        // SEQUÊNCIA CORRETA: 1, 2, 3
        
        // Executar Servidor 1 (TropicalPlayTV) - PRIMEIRO
        if (scriptServidor1 && arquivoExiste(scriptServidor1)) {
            console.log('');
            console.log('🌴 === SERVIDOR 1: TROPICALPLAYTV ===');
            log('Iniciando renovação no TropicalPlayTV...', 'header');
            log(`Executando: ${scriptServidor1} ${clienteId} ${meses}`, 'info');
            
            const resultado1 = await executarScript(scriptServidor1, clienteId, meses);
            resultado1.servidor = 'TropicalPlayTV';
            resultado1.meses = meses;
            resultados.push(resultado1);
            
            // Aguardar entre execuções para evitar conflitos
            log('Aguardando 5 segundos antes do próximo servidor...', 'info');
            await sleep(5000);
        } else {
            log(`⚠️ Script do Servidor 1 não encontrado: ${scriptServidor1}`, 'warning');
            resultados.push({ 
                success: false, 
                servidor: 'TropicalPlayTV', 
                error: 'Script não encontrado',
                meses: meses
            });
        }
        
        // Executar Servidor 2 (SpiderTV) - SEGUNDO
        if (scriptServidor2 && arquivoExiste(scriptServidor2)) {
            console.log('');
            console.log('🕷️ === SERVIDOR 2: SPIDERTV ===');
            log('Iniciando renovação no SpiderTV...', 'header');
            
            const resultado2 = await executarScript(scriptServidor2, clienteId);
            resultado2.servidor = 'SpiderTV';
            resultado2.meses = meses;
            resultados.push(resultado2);
            
            // Aguardar entre execuções para evitar conflitos
            log('Aguardando 5 segundos antes do próximo servidor...', 'info');
            await sleep(5000);
        }
        
        // Executar Servidor 3 (Premium Server) - TERCEIRO
        if (scriptServidor3 && arquivoExiste(scriptServidor3)) {
            console.log('');
            console.log('⭐ === SERVIDOR 3: PREMIUM SERVER ===');
            log('Iniciando renovação no Premium Server...', 'header');
            
            const resultado3 = await executarScript(scriptServidor3, clienteId);
            resultado3.servidor = 'Premium Server';
            resultado3.meses = meses;
            resultados.push(resultado3);
        }
        
    } catch (error) {
        log(`❌ Erro geral: ${error.message}`, 'error');
    } finally {
        // Relatório final
        console.log('');
        console.log('📊 === RELATÓRIO FINAL ===');
        console.log(`🎯 Cliente: ${clienteId}`);
        console.log(`📅 Período: ${meses} mês(es)`);
        console.log('='.repeat(50));
        
        let sucessos = 0;
        let falhas = 0;
        
        resultados.forEach(resultado => {
            const status = resultado.success ? 'SUCESSO' : 'FALHA';
            const emoji = resultado.success ? '✅' : '❌';
            const erro = resultado.success ? '' : ` - ${resultado.error || 'Erro desconhecido'}`;
            const script = resultado.script ? ` [${resultado.script}]` : '';
            
            console.log(`${emoji} ${resultado.servidor}: ${status}${erro}${script}`);
            
            if (resultado.success) {
                sucessos++;
            } else {
                falhas++;
            }
        });
        
        console.log('='.repeat(50));
        console.log(`📈 Sucessos: ${sucessos}/${resultados.length}`);
        console.log(`📉 Falhas: ${falhas}/${resultados.length}`);
        
        if (sucessos === resultados.length) {
            console.log('🎉 TODAS AS RENOVAÇÕES FORAM REALIZADAS COM SUCESSO!');
        } else if (sucessos > 0) {
            console.log('⚠️ ALGUMAS RENOVAÇÕES FORAM REALIZADAS COM SUCESSO');
        } else {
            console.log('💥 TODAS AS RENOVAÇÕES FALHARAM');
        }
        
        console.log('');
        console.log('🏁 PROCESSO FINALIZADO!');
        console.log('');
        console.log('📖 Como usar:');
        console.log('node renovar-3-servidores-sequencial.cjs <cliente_id> <meses>');
        console.log('');
        console.log('📖 Exemplos:');
        console.log('node renovar-3-servidores-sequencial.cjs 648718886 1   # 1 mês');
        console.log('node renovar-3-servidores-sequencial.cjs 648718886 3   # 3 meses');
        console.log('node renovar-3-servidores-sequencial.cjs 648718886 6   # 6 meses');
        console.log('node renovar-3-servidores-sequencial.cjs 648718886 12  # 12 meses');
        console.log('');
        console.log('📖 Scripts utilizados:');
        console.log('🌴 TropicalPlayTV: renovar-servidor1-fluxo-completo.cjs (unificado)');
        console.log('🕷️ SpiderTV: renovar-servidor2-<periodo>mes-correto.cjs');
        console.log('⭐ Premium Server: renovar-servidor3-<periodo>mes-correto.cjs');
    }
}

// Validação de argumentos
const clienteId = process.argv[2];
const meses = parseInt(process.argv[3]) || 1;

if (!clienteId) {
    console.log('❌ Erro: Cliente ID é obrigatório');
    console.log('📖 Uso: node renovar-3-servidores-sequencial.cjs <cliente_id> <meses>');
    console.log('📖 Exemplo: node renovar-3-servidores-sequencial.cjs 648718886 6');
    console.log('');
    console.log('📖 Períodos suportados: 1, 3, 6, 12 meses');
    console.log('');
    console.log('📖 Posições corretas implementadas:');
    console.log('⭐ Servidor 3 (Premium Server):');
    console.log('   - 1 mês: Posição 0 ("1 MÊS COMPLETO C/ ADULTO")');
    console.log('   - 3 meses: Posição 2 ("3 MÊS C/ ADULTO")');
    console.log('   - 6 meses: Posição 4 ("6 MÊS C/ ADULTO")');
    console.log('   - 12 meses: Posição 6 ("ANUAL COMPLETO")');
    console.log('');
    console.log('🕷️ Servidor 2 (SpiderTV): Implementação corrigida e testada');
    process.exit(1);
}

if (![1, 3, 6, 12].includes(meses)) {
    console.log('❌ Erro: Período deve ser 1, 3, 6 ou 12 meses');
    console.log('📖 Períodos suportados: 1, 3, 6, 12');
    process.exit(1);
}

// Executar renovação
renovarTodosServidores(clienteId, meses).catch(console.error);
