import fetch from 'node-fetch';

async function testWebInterface() {
  try {
    console.log('🧪 Testando interface web...');

    // Testar se o servidor responde
    const response = await fetch('http://localhost:8080/');
    const html = await response.text();

    console.log('✅ Servidor respondeu');
    console.log('📄 HTML contém título:', html.includes('<title>'));
    console.log('📄 HTML contém SpiderTV:', html.includes('SpiderTV'));
    console.log('📄 HTML contém TropicalPlayTV:', html.includes('TropicalPlayTV'));

    // Verificar se o CSS está sendo servido
    const cssResponse = await fetch('http://localhost:8080/css/style.css');
    console.log('🎨 CSS acessível:', cssResponse.ok);

    // Verificar se o JS está sendo servido
    const jsResponse = await fetch('http://localhost:8080/js/app.js');
    console.log('📜 JS acessível:', jsResponse.ok);

    console.log('✅ Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar apenas se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testWebInterface();
}
