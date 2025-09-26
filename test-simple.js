/**
 * Teste simples do servidor
 */

import 'dotenv/config';
import express from 'express';

const PORT = Number(process.env.PORT || 8080);

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/health', async (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Servidor funcionando!'
  });
});

app.get('/test', async (_req, res) => {
  res.json({
    status: 'test ok',
    env: {
      SERVER1_USER: process.env.SERVER1_USER ? 'definido' : 'não definido',
      SERVER1_PASS: process.env.SERVER1_PASS ? 'definido' : 'não definido',
      BASE_URL: process.env.BASE_URL || 'não definido'
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor de teste rodando em http://localhost:${PORT}`);
  console.log(`🔍 Teste: curl http://localhost:${PORT}/health`);
  console.log(`🔍 Teste: curl http://localhost:${PORT}/test`);
});
