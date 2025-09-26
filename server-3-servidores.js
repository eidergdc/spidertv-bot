/**
 * Servidor HTTP para renovação nos 3 servidores
 * TropicalPlayTV + SpiderTV + Premium Server
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

const PORT = process.env.PORT || 8080;

console.log('🕷️ Servidor Bot 3 Servidores');
console.log('🌐 TropicalPlayTV + SpiderTV + Premium Server');

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        server: 'Bot 3 Servidores',
        servidores: ['TropicalPlayTV', 'SpiderTV', 'Premium Server'],
        version: '1.0.0'
    });
});

// Renovação nos 3 servidores
app.post('/activate/3servidores', async (req, res) => {
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
                        output: output.split('\n').slice(-10).join('\n') // Últimas 10 linhas
                    }));
                } else {
                    // Erro
                    resolve(res.status(500).json({
                        ok: false,
                        error: `Processo falhou com código ${code_exit}`,
                        cliente: code,
                        meses: months,
                        output: output,
                        errorOutput: errorOutput
                    }));
                }
            });

            child.on('error', (error) => {
                console.error('💥 Erro ao executar script:', error.message);
                resolve(res.status(500).json({
                    ok: false,
                    error: `Erro ao executar: ${error.message}`,
                    cliente: code,
                    meses: months
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
});

// Renovação individual por servidor
app.post('/activate/servidor1', async (req, res) => {
    return executeIndividualServer(req, res, 'servidor1', 'TropicalPlayTV');
});

app.post('/activate/servidor2', async (req, res) => {
    return executeIndividualServer(req, res, 'servidor2', 'SpiderTV');
});

app.post('/activate/servidor3', async (req, res) => {
    return executeIndividualServer(req, res, 'servidor3', 'Premium Server');
});

// Função para executar servidor individual
async function executeIndividualServer(req, res, servidor, nomeServidor) {
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
            scriptName = `renovar-servidor1-${months}meses-correto.cjs`;
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
                        output: output.split('\n').slice(-5).join('\n')
                    }));
                } else {
                    resolve(res.status(500).json({
                        ok: false,
                        error: `${nomeServidor} falhou com código ${code_exit}`,
                        cliente: code,
                        meses: months,
                        servidor: nomeServidor,
                        output: output,
                        errorOutput: errorOutput
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
                    servidor: nomeServidor
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

// Rota de informações
app.get('/', (req, res) => {
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
    console.log('');
    console.log('📋 COMANDOS DISPONÍVEIS:');
    console.log('');
    console.log('🎯 RENOVAR NOS 3 SERVIDORES:');
    console.log(`curl -X POST http://localhost:${PORT}/activate/3servidores \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"code":"648718886","months":6}'`);
    console.log('');
    console.log('🎯 RENOVAR SERVIDOR INDIVIDUAL:');
    console.log(`curl -X POST http://localhost:${PORT}/activate/servidor2 \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"code":"648718886","months":1}'`);
    console.log('');
    console.log('✅ Meses disponíveis: 1, 3, 6, 12');
});
