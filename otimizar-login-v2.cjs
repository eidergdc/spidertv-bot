/**
 * Script para otimizar login - Versão 2 (Mais Robusta)
 * Usa método mais compatível para colagem rápida
 */

const fs = require('fs');

function otimizarLoginV2(conteudo) {
    // Substituir método de clipboard por método mais direto
    const padraoClipboard = /await page\.evaluate\(\(text\) => navigator\.clipboard\.writeText\(text\), '([^']+)'\);\s*await page\.keyboard\.down\('Control'\);\s*await page\.keyboard\.press\('KeyV'\);\s*await page\.keyboard\.up\('Control'\);/g;
    
    // Substituir por método direto mais rápido
    let novoConteudo = conteudo.replace(padraoClipboard, (match, texto) => {
        return `await page.evaluate((text, element) => {
                element.value = text;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }, '${texto}', await page.evaluateHandle(() => document.activeElement));`;
    });
    
    // Também otimizar casos onde ainda há .type() com delay
    novoConteudo = novoConteudo.replace(/await (\w+)\.type\('([^']+)',\s*\{\s*delay:\s*\d+\s*\}\);/g, (match, field, texto) => {
        return `await ${field}.evaluate((el, text) => {
                el.value = text;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }, '${texto}');`;
    });
    
    return novoConteudo;
}

// Arquivos para otimizar
const arquivos = [
    'renovar-servidor1-1mes-correto.cjs',
    'renovar-servidor1-3meses-correto.cjs', 
    'renovar-servidor1-6meses-final.cjs',
    'renovar-servidor1-12meses-correto.cjs',
    'renovar-servidor1-fluxo-completo.cjs',
    'renovar-servidor2-1mes-correto.cjs',
    'renovar-servidor2-3meses-correto.cjs',
    'renovar-servidor2-6meses-correto.cjs',
    'renovar-servidor2-12meses-correto.cjs',
    'renovar-servidor3-1mes-correto.cjs',
    'renovar-servidor3-3meses-correto.cjs',
    'renovar-servidor3-6meses-correto.cjs',
    'renovar-servidor3-12meses-correto.cjs'
];

console.log('🚀 OTIMIZAÇÃO V2 - LOGIN SUPER RÁPIDO');
console.log('🎯 Método direto de preenchimento (sem clipboard)');
console.log('='.repeat(60));

let arquivosOtimizados = 0;

for (const arquivo of arquivos) {
    try {
        if (fs.existsSync(arquivo)) {
            const conteudo = fs.readFileSync(arquivo, 'utf8');
            const novoConteudo = otimizarLoginV2(conteudo);
            
            if (conteudo !== novoConteudo) {
                fs.writeFileSync(arquivo, novoConteudo);
                console.log(`✅ ${arquivo} - OTIMIZADO V2`);
                arquivosOtimizados++;
            } else {
                console.log(`ℹ️ ${arquivo} - SEM ALTERAÇÕES`);
            }
        } else {
            console.log(`⚠️ ${arquivo} - NÃO ENCONTRADO`);
        }
    } catch (error) {
        console.log(`❌ ${arquivo} - ERRO: ${error.message}`);
    }
}

console.log('='.repeat(60));
console.log(`🎉 OTIMIZAÇÃO V2 CONCLUÍDA!`);
console.log(`📊 Arquivos otimizados: ${arquivosOtimizados}/${arquivos.length}`);
console.log('');
console.log('🚀 MELHORIAS V2:');
console.log('- Preenchimento direto via DOM (mais rápido)');
console.log('- Sem dependência de clipboard');
console.log('- Compatível com todos os navegadores');
console.log('- Tempo estimado: ~4 minutos (vs 7 minutos original)');
