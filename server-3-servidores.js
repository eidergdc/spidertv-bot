/**
 * Servidor HTTP para renovação nos 3 servidores
 * TropicalPlayTV + SpiderTV + Premium Server
 * 
 * ✅ SISTEMA DE FILA IMPLEMENTADO
 * - Processa uma renovação por vez
 * - Enfileira requisições simultâneas
 * - Evita conflitos entre navegadores
 */

import 'dotenv/config';
import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));

// 🌐 Servir arquivos estáticos da pasta public
app.use(express.static('public'));

const PORT = process.env.PORT || 8080;

// 🔄 SISTEMA DE FILA
let filaRenovacao = [];
let processandoAtualmente = false;

console.log('🕷️ Servidor Bot 3 Servidores');
console.log('🌐 TropicalPlayTV + SpiderTV + Premium Server');
console.log('🔄 Sistema de Fila: ATIVADO');

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        server: 'Bot 3 Servidores',
        servidores: ['TropicalPlayTV', 'SpiderTV', 'Premium Server'],
        version: '1.0.0'
    });
});

// 🔄 FUNÇÃO PARA PROCESSAR FILA
async function processarFila() {
    if (processandoAtualmente || filaRenovacao.length === 0) {
        return;
    }

    processandoAtualmente = true;
    const { req, res, tipo, servidor, nomeServidor } = filaRenovacao.shift();

    console.log(`\n📋 PROCESSANDO FILA - ${filaRenovacao.length} restantes`);
    console.log(`🎯 Atual: ${req.body.code} (${req.body.months || 1} meses)`);

    try {
        if (tipo === '3servidores') {
            await executar3Servidores(req, res);
        } else {
            await executarServidorIndividual(req, res, servidor, nomeServidor);
        }
    } catch (error) {
        console.error('💥 Erro na fila:', error.message);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    } finally {
        processandoAtualmente = false;
        // Processar próximo da fila
        setTimeout(processarFila, 1000);
    }
}

// Renovação nos 3 servidores
app.post('/activate/3servidores', async (req, res) => {
    const { code, months = 1 } = req.body || {};
    
    if (!code) {
        return res.status(400).json({ 
            ok: false, 
            error: 'Código do cliente é obrigatório' 
        });
    }

    if (![1, 3, 6, 12].includes(months)) {
        return res.status(400).json({ 
            ok: false, 
            error: 'Meses deve ser 1, 3, 6 ou 12' 
        });
    }

    // Adicionar à fila
    filaRenovacao.push({
        req,
        res,
        tipo: '3servidores',
        timestamp: new Date().toISOString()
    });

    console.log(`📥 ADICIONADO À FILA: Cliente ${code} (${months} meses)`);
    console.log(`📋 Posição na fila: ${filaRenovacao.length}`);
    
    if (processandoAtualmente) {
        console.log(`⏳ Aguardando... Processando outro cliente`);
    }

    // Iniciar processamento da fila
    processarFila();
});

// Função para executar 3 servidores
async function executar3Servidores(req, res) {
    const { code, months = 1 } = req.body || {};

    console.log(`🔄 Iniciando renovação - Cliente: ${code}, Meses: ${months}`);
    console.log('🎯 Servidores: TropicalPlayTV → SpiderTV → Premium Server');

    // Executar o comando sequencial
    const scriptPath = path.join(__dirname, 'renovar-3-servidores-sequencial.cjs');
    
    return new Promise((resolve) => {
        const child = spawn('node', [scriptPath, code, months], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: __dirname
        });

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data) => {
            const text = data.toString();
            output += text;
            console.log(text.trim());
        });

        child.stderr.on('data', (data) => {
            const text = data.toString();
            errorOutput += text;
            console.error(text.trim());
        });

        child.on('close', (code_exit) => {
            console.log(`\n🏁 Processo finalizado com código: ${code_exit}`);
            
            if (code_exit === 0) {
                // Sucesso
                resolve(res.json({
                    ok: true,
                    message: `Cliente ${code} renovado com sucesso nos 3 servidores`,
                    cliente: code,
                    meses: months,
                    servidores: ['TropicalPlayTV', 'SpiderTV', 'Premium Server'],
                    output: output.split('\n').slice(-10).join('\n'), // Últimas 10 linhas
                    filaRestante: filaRenovacao.length
                }));
            } else {
                // Erro
                resolve(res.status(500).json({
                    ok: false,
                    error: `Processo falhou com código ${code_exit}`,
                    cliente: code,
                    meses: months,
                    output: output,
                    errorOutput: errorOutput,
                    filaRestante: filaRenovacao.length
                }));
            }
        });

        child.on('error', (error) => {
            console.error('💥 Erro ao executar script:', error.message);
            resolve(res.status(500).json({
                ok: false,
                error: `Erro ao executar: ${error.message}`,
                cliente: code,
                meses: months,
                filaRestante: filaRenovacao.length
            }));
        });
    });
}

// Renovação individual por servidor
app.post('/activate/servidor1', async (req, res) => {
    return adicionarFilaIndividual(req, res, 'servidor1', 'TropicalPlayTV');
});

app.post('/activate/servidor2', async (req, res) => {
    return adicionarFilaIndividual(req, res, 'servidor2', 'SpiderTV');
});

app.post('/activate/servidor3', async (req, res) => {
    return adicionarFilaIndividual(req, res, 'servidor3', 'Premium Server');
});

// Adicionar servidor individual à fila
function adicionarFilaIndividual(req, res, servidor, nomeServidor) {
    const { code, months = 1 } = req.body || {};
    
    if (!code) {
        return res.status(400).json({ 
            ok: false, 
            error: 'Código do cliente é obrigatório' 
        });
    }

    if (![1, 3, 6, 12].includes(months)) {
        return res.status(400).json({ 
            ok: false, 
            error: 'Meses deve ser 1, 3, 6 ou 12' 
        });
    }

    // Adicionar à fila
    filaRenovacao.push({
        req,
        res,
        tipo: 'individual',
        servidor,
        nomeServidor,
        timestamp: new Date().toISOString()
    });

    console.log(`📥 ADICIONADO À FILA: ${nomeServidor} - Cliente ${code} (${months} meses)`);
    console.log(`📋 Posição na fila: ${filaRenovacao.length}`);
    
    if (processandoAtualmente) {
        console.log(`⏳ Aguardando... Processando outro cliente`);
    }

    // Iniciar processamento da fila
    processarFila();
}

// Função para executar servidor individual
async function executarServidorIndividual(req, res, servidor, nomeServidor) {
    try {
        const { code, months = 1 } = req.body || {};
        
        if (!code) {
            return res.status(400).json({ 
                ok: false, 
                error: 'Código do cliente é obrigatório' 
            });
        }

        if (![1, 3, 6, 12].includes(months)) {
            return res.status(400).json({ 
                ok: false, 
                error: 'Meses deve ser 1, 3, 6 ou 12' 
            });
        }

        console.log(`🔄 Renovação ${nomeServidor} - Cliente: ${code}, Meses: ${months}`);

        // Determinar o script correto
        let scriptName;
        if (servidor === 'servidor1') {
            // Para servidor1, usar os novos scripts com nomenclatura correta
            if (months === 1) {
                scriptName = `renovar-servidor1-1mes-novo.cjs`;
            } else {
                scriptName = `renovar-servidor1-${months}meses-novo.cjs`;
            }
        } else if (servidor === 'servidor2') {
            scriptName = `renovar-servidor2-${months}meses-correto.cjs`;
        } else if (servidor === 'servidor3') {
            scriptName = `renovar-servidor3-${months}meses-correto.cjs`;
        }

        const scriptPath = path.join(__dirname, scriptName);
        
        return new Promise((resolve) => {
            const child = spawn('node', [scriptPath, code], {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: __dirname
            });

            let output = '';
            let errorOutput = '';

            child.stdout.on('data', (data) => {
                const text = data.toString();
                output += text;
                console.log(text.trim());
            });

            child.stderr.on('data', (data) => {
                const text = data.toString();
                errorOutput += text;
                console.error(text.trim());
            });

            child.on('close', (code_exit) => {
                console.log(`\n🏁 ${nomeServidor} finalizado com código: ${code_exit}`);
                
                if (code_exit === 0) {
                    resolve(res.json({
                        ok: true,
                        message: `Cliente ${code} renovado com sucesso no ${nomeServidor}`,
                        cliente: code,
                        meses: months,
                        servidor: nomeServidor,
                        output: output.split('\n').slice(-5).join('\n'),
                        filaRestante: filaRenovacao.length
                    }));
                } else {
                    resolve(res.status(500).json({
                        ok: false,
                        error: `${nomeServidor} falhou com código ${code_exit}`,
                        cliente: code,
                        meses: months,
                        servidor: nomeServidor,
                        output: output,
                        errorOutput: errorOutput,
                        filaRestante: filaRenovacao.length
                    }));
                }
            });

            child.on('error', (error) => {
                console.error(`💥 Erro ${nomeServidor}:`, error.message);
                resolve(res.status(500).json({
                    ok: false,
                    error: `Erro ao executar ${nomeServidor}: ${error.message}`,
                    cliente: code,
                    meses: months,
                    servidor: nomeServidor,
                    filaRestante: filaRenovacao.length
                }));
            });
        });

    } catch (error) {
        console.error('💥 Erro:', error.message);
        return res.status(500).json({
            ok: false,
            error: error.message
        });
    }
}

// 📊 Status da fila
app.get('/fila', (req, res) => {
    res.json({
        filaAtual: filaRenovacao.length,
        processandoAtualmente,
        proximosClientes: filaRenovacao.slice(0, 5).map(item => ({
            cliente: item.req.body.code,
            meses: item.req.body.months || 1,
            tipo: item.tipo,
            servidor: item.nomeServidor || '3 Servidores',
            timestamp: item.timestamp
        }))
    });
});

// Rota de informações
app.get('/api', (req, res) => {
    res.json({
        server: 'Bot 3 Servidores',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            renovar_3_servidores: 'POST /activate/3servidores',
            renovar_servidor1: 'POST /activate/servidor1',
            renovar_servidor2: 'POST /activate/servidor2', 
            renovar_servidor3: 'POST /activate/servidor3'
        },
        exemplo: {
            url: `http://localhost:${PORT}/activate/3servidores`,
            body: {
                code: "648718886",
                months: 6
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`🌐 Interface Web: http://localhost:${PORT}`);
    console.log('');
    console.log('📋 COMANDOS MAKE DISPONÍVEIS:');
    console.log('  make start       - Iniciar servidor');
    console.log('  make health      - Verificar status');
    console.log('  make status      - Ver fila');
    console.log('  make stop        - Parar servidor');
    console.log('');
    console.log('🎯 RENOVAR VIA CURL:');
    console.log(`curl -X POST http://localhost:${PORT}/activate/3servidores \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"code":"648718886","months":6}'`);
    console.log('');
    console.log('✅ Meses disponíveis: 1, 3, 6, 12');
    console.log('🔄 Sistema de Fila: Evita conflitos entre renovações simultâneas');
});
