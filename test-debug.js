/**
 * Teste de debug para identificar onde está o problema
 */

console.log('🔍 Iniciando teste de debug...');

// Teste 1: Imports básicos
console.log('📦 Testando imports...');
try {
  await import('dotenv/config');
  console.log('✅ dotenv importado');
  
  const express = await import('express');
  console.log('✅ express importado');
  
  const { chromium } = await import('playwright');
  console.log('✅ playwright importado');
  
  const fs = await import('fs/promises');
  console.log('✅ fs/promises importado');
  
  const path = await import('path');
  console.log('✅ path importado');
  
  const url = await import('url');
  console.log('✅ url importado');
  
} catch (error) {
  console.error('❌ Erro nos imports:', error.message);
  process.exit(1);
}

// Teste 2: Variáveis de ambiente
console.log('🔧 Testando variáveis de ambiente...');
const BASE_URL = process.env.BASE_URL || 'https://painel.tropicalplaytv.com';
const USERNAME = process.env.SERVER1_USER || '';
const PASSWORD = process.env.SERVER1_PASS || '';
const PORT = Number(process.env.PORT || 8080);

console.log('BASE_URL:', BASE_URL);
console.log('USERNAME:', USERNAME ? 'definido' : 'não definido');
console.log('PASSWORD:', PASSWORD ? 'definido' : 'não definido');
console.log('PORT:', PORT);

// Teste 3: Express básico
console.log('🌐 Testando Express...');
try {
  const express = (await import('express')).default;
  const app = express();
  
  app.get('/test', (req, res) => {
    res.json({ status: 'ok', message: 'Teste funcionando!' });
  });
  
  const server = app.listen(PORT, () => {
    console.log(`✅ Servidor Express funcionando na porta ${PORT}`);
    
    // Teste a própria API
    setTimeout(async () => {
      try {
        const response = await fetch(`http://localhost:${PORT}/test`);
        const data = await response.json();
        console.log('✅ Teste da API:', data);
        server.close();
        console.log('✅ Servidor fechado com sucesso');
        process.exit(0);
      } catch (error) {
        console.error('❌ Erro no teste da API:', error.message);
        server.close();
        process.exit(1);
      }
    }, 1000);
  });
  
} catch (error) {
  console.error('❌ Erro no Express:', error.message);
  process.exit(1);
}
