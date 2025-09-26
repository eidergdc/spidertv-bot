# 🚀 Renovação Automática nos 3 Servidores

Este script permite renovar um cliente automaticamente nos 3 servidores com um único comando.

## 📋 Servidores Incluídos

1. **🌴 Servidor 1 - TropicalPlayTV**
   - URL: https://painel.tropicalplaytv.com
   - Usuário: Eider Goncalves
   - Senha: Goncalves1@

2. **🕷️ Servidor 2 - SpiderTV**
   - URL: https://spidertv.sigma.st
   - Usuário: tropicalplay
   - Senha: Virginia13

3. **⭐ Servidor 3 - Premium Server**
   - URL: https://premiumserver.sigma.st
   - Usuário: eidergdc
   - Senha: Premium2025@

## 🎯 Como Usar

### Comando Básico (1 mês)
```bash
node renovar-3-servidores.cjs
```
*Renova o cliente padrão (648718886) por 1 mês*

### Comando com Cliente Específico
```bash
node renovar-3-servidores.cjs 123456789 1
```
*Renova o cliente 123456789 por 1 mês*

### Comando com Diferentes Períodos
```bash
# Renovar por 3 meses
node renovar-3-servidores.cjs 648718886 3

# Renovar por 6 meses
node renovar-3-servidores.cjs 648718886 6

# Renovar por 1 ano (12 meses)
node renovar-3-servidores.cjs 648718886 12
```

## 📊 O que o Script Faz

1. **Lança o navegador** (modo visível para acompanhar)
2. **Renova sequencialmente** nos 3 servidores:
   - Faz login automaticamente
   - Busca o cliente pelo ID
   - Executa a renovação
   - Confirma a operação
3. **Gera relatório final** com status de cada servidor
4. **Continua mesmo se um servidor falhar**

## 🔍 Logs Detalhados

O script fornece logs coloridos e informativos:

```
🚀 INICIANDO RENOVAÇÃO NOS 3 SERVIDORES
🎯 Cliente: 648718886
============================================================

🌐 Lançando navegador...
✅ Navegador lançado!

🌴 === SERVIDOR 1: TROPICALPLAYTV ===
[10:30:15] 🌴 TropicalPlayTV ℹ️ Iniciando renovação...
[10:30:18] 🌴 TropicalPlayTV ℹ️ Navegando para o painel...
[10:30:22] 🌴 TropicalPlayTV ℹ️ Fazendo login...
[10:30:25] 🌴 TropicalPlayTV ✅ Login realizado!
[10:30:28] 🌴 TropicalPlayTV ℹ️ Navegando para página de clientes...
[10:30:32] 🌴 TropicalPlayTV ℹ️ Buscando cliente 648718886...
[10:30:35] 🌴 TropicalPlayTV ℹ️ Procurando botão de renovação...
[10:30:38] 🌴 TropicalPlayTV ✅ Renovação realizada com sucesso!

🕷️ === SERVIDOR 2: SPIDERTV ===
[10:30:42] 🕷️ SpiderTV ℹ️ Iniciando renovação...
...

⭐ === SERVIDOR 3: PREMIUM SERVER ===
[10:31:15] ⭐ Premium Server ℹ️ Iniciando renovação...
...

📊 === RELATÓRIO FINAL ===
🎯 Cliente: 648718886
========================================
✅ Servidor 1 (TropicalPlayTV): SUCESSO
✅ Servidor 2 (SpiderTV): SUCESSO
✅ Servidor 3 (Premium Server): SUCESSO
========================================
📈 Sucessos: 3/3
📉 Falhas: 0/3
🎉 TODAS AS RENOVAÇÕES FORAM REALIZADAS COM SUCESSO!
```

## ⚠️ Características Importantes

- **Navegador Visível**: O script roda com navegador visível para você acompanhar
- **Velocidade Controlada**: Usa `slowMo: 500ms` para evitar detecção
- **Tratamento de Erros**: Continua mesmo se um servidor falhar
- **Logs Timestampados**: Cada ação é registrada com horário
- **Relatório Final**: Mostra status de cada servidor ao final

## 🛠️ Requisitos

- Node.js instalado
- Puppeteer instalado (`npm install puppeteer`)
- Conexão com internet estável

## 🔧 Personalização

Para alterar configurações, edite as constantes no início do arquivo `renovar-3-servidores.cjs`:

```javascript
const SERVIDORES = {
    servidor1: {
        nome: 'TropicalPlayTV',
        url: 'https://painel.tropicalplaytv.com',
        usuario: 'Eider Goncalves',
        senha: 'Goncalves1@',
        emoji: '🌴'
    },
    // ...
};
```

## 📝 Exemplos de Uso

```bash
# Renovar cliente padrão por 1 mês
node renovar-3-servidores.cjs

# Renovar cliente específico por 1 mês
node renovar-3-servidores.cjs 155357738 1

# Renovar por 3 meses
node renovar-3-servidores.cjs 364572675 3

# Renovar por 6 meses
node renovar-3-servidores.cjs 648718886 6

# Renovar por 1 ano
node renovar-3-servidores.cjs 648718886 12
```

## 📋 Planos Selecionados Automaticamente

### 🕷️ Servidor 2 (SpiderTV)
- **1 mês**: PLANO COMPLETO
- **3 meses**: PLANO COMPLETO - TRIMESTRAL
- **6 meses**: PLANO COMPLETO - SEMESTRAL
- **12 meses**: PLANO COMPLETO - ANUAL

### ⭐ Servidor 3 (Premium Server)
- **1 mês**: PLANO COMPLETO C/ADULTO
- **3 meses**: 3 MES C/ ADULTO
- **6 meses**: 6 MES C/ ADULTO
- **12 meses**: ANUAL COMPLETO

*O Servidor 1 (TropicalPlayTV) usa o sistema padrão de seleção de meses.*

## 🎉 Pronto!

Agora você pode renovar clientes nos 3 servidores com um único comando! 🚀
