/**
 * Cliente para testar renovação no SpiderTV usando servidor remoto
 */

import axios from 'axios';

const REMOTE_SERVER = 'http://45.55.81.215:8080';
const CLIENT_CODE = '364572675';
const MONTHS = 1;

console.log('🕷️ Cliente SpiderTV - Teste de Renovação');
console.log('🌐 Servidor remoto:', REMOTE_SERVER);
console.log('👤 Cliente:', CLIENT_CODE);
console.log('📅 Meses:', MONTHS);

async function testRenewal() {
    try {
        console.log('\n🔍 Testando conexão com servidor remoto...');
        
        // Primeiro, testar health check
        console.log('📋 Fazendo health check...');
        const healthResponse = await axios.get(`${REMOTE_SERVER}/health`, {
            timeout: 10000
        });
        
        console.log('✅ Health check OK:', healthResponse.data);
        
        // Agora fazer a renovação
        console.log('\n🔄 Iniciando renovação...');
        console.log('⏳ Enviando requisição para o bot remoto...');
        
        const renewalData = {
            code: CLIENT_CODE,
            months: MONTHS
        };
        
        console.log('📤 Dados enviados:', JSON.stringify(renewalData, null, 2));
        
        const startTime = Date.now();
        
        const response = await axios.post(`${REMOTE_SERVER}/activate/spidertv`, renewalData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 120000 // 2 minutos
        });
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log(`\n🎉 Renovação concluída em ${duration}s!`);
        console.log('📥 Resposta do servidor:');
        console.log(JSON.stringify(response.data, null, 2));
        
        if (response.data.ok) {
            console.log('\n✅ SUCESSO! Cliente renovado com sucesso!');
        } else {
            console.log('\n❌ FALHA! Renovação não foi bem-sucedida');
        }
        
    } catch (error) {
        console.error('\n💥 Erro durante renovação:');
        
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📄 Dados:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('🌐 Erro de rede - servidor não respondeu');
            console.error('📡 Request:', error.request);
        } else {
            console.error('⚙️ Erro de configuração:', error.message);
        }
        
        console.error('🔍 Stack completo:', error.stack);
    }
}

console.log('\n🚀 Iniciando teste...');
testRenewal();
