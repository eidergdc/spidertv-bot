// Teste básico sem dependências externas
console.log('✅ Node.js funcionando!');
console.log('📦 Versão:', process.version);
console.log('📁 Diretório:', process.cwd());

// Teste de import básico
try {
  console.log('🔍 Testando import...');
  import('fs').then(() => {
    console.log('✅ Import funcionando!');
    process.exit(0);
  }).catch(err => {
    console.error('❌ Erro no import:', err.message);
    process.exit(1);
  });
} catch (err) {
  console.error('❌ Erro:', err.message);
  process.exit(1);
}
