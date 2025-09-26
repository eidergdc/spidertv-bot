# 🕷️ SpiderTV Bot - API HTTP

Bot de automação para renovação de clientes nos 3 servidores:
- **TropicalPlayTV** (Servidor 1)
- **SpiderTV** (Servidor 2) 
- **Premium Server** (Servidor 3)

## 🚀 Como Iniciar o Servidor

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start
# ou
node server-3-servidores.js
```

O servidor rodará em: `http://localhost:8080`

## 📋 Endpoints Disponíveis

### 🎯 Renovar nos 3 Servidores (Recomendado)
```bash
curl -X POST http://localhost:8080/activate/3servidores \
  -H "Content-Type: application/json" \
  -d '{"code":"648718886","months":6}'
```

### 🎯 Renovar Servidor Individual

**TropicalPlayTV (Servidor 1):**
```bash
curl -X POST http://localhost:8080/activate/servidor1 \
  -H "Content-Type: application/json" \
  -d '{"code":"648718886","months":1}'
```

**SpiderTV (Servidor 2):**
```bash
curl -X POST http://localhost:8080/activate/servidor2 \
  -H "Content-Type: application/json" \
  -d '{"code":"648718886","months":3}'
```

**Premium Server (Servidor 3):**
```bash
curl -X POST http://localhost:8080/activate/servidor3 \
  -H "Content-Type: application/json" \
  -d '{"code":"648718886","months":12}'
```

### 🔍 Health Check
```bash
curl http://localhost:8080/health
```

## 📊 Parâmetros

| Parâmetro | Tipo | Obrigatório | Valores | Descrição |
|-----------|------|-------------|---------|-----------|
| `code` | string | ✅ Sim | ID do cliente | Código do cliente para renovar |
| `months` | number | ❌ Não | 1, 3, 6, 12 | Período de renovação (padrão: 1) |

## 📝 Exemplos de Resposta

### ✅ Sucesso
```json
{
  "ok": true,
  "message": "Cliente 648718886 renovado com sucesso nos 3 servidores",
  "cliente": "648718886",
  "meses": 6,
  "servidores": ["TropicalPlayTV", "SpiderTV", "Premium Server"],
  "output": "🎉 RENOVAÇÃO CONCLUÍDA COM SUCESSO!"
}
```

### ❌ Erro
```json
{
  "ok": false,
  "error": "Código do cliente é obrigatório",
  "cliente": null,
  "meses": 1
}
```

## 🎯 Posições dos Planos (Corrigidas)

### Servidor 3 (Premium Server)
- **1 mês:** Posição 0 → "1 MÊS COMPLETO C/ ADULTO"
- **3 meses:** Posição 2 → "3 MÊS C/ ADULTO"  
- **6 meses:** Posição 4 → "6 MÊS C/ ADULTO"
- **12 meses:** Posição 6 → "ANUAL COMPLETO"

## 🔧 Configuração

O bot usa os scripts individuais já testados:
- `renovar-servidor1-*meses-correto.cjs`
- `renovar-servidor2-*meses-correto.cjs` 
- `renovar-servidor3-*meses-correto.cjs`
- `renovar-3-servidores-sequencial.cjs`

## 🧪 Testes Realizados

✅ **Cliente 648718886 (6 meses):** 3/3 servidores  
✅ **Cliente 145285495 (1 mês):** 3/3 servidores  
✅ **Cliente 145285495 (3 meses):** 2/3 servidores  

## 🚀 Deploy em Servidor

Para rodar em um servidor externo (como o seu IP 45.55.81.215):

```bash
# No servidor
git clone https://github.com/eidergdc/spidertv-bot.git
cd spidertv-bot
npm install
npm start
```

Então use:
```bash
curl -X POST http://45.55.81.215:8080/activate/3servidores \
  -H "Content-Type: application/json" \
  -d '{"code":"648718886","months":6}'
```

## 📁 Estrutura do Projeto

```
spidertv-bot/
├── server-3-servidores.js          # 🚀 Servidor HTTP principal
├── renovar-3-servidores-sequencial.cjs  # 🎯 Script sequencial
├── renovar-servidor1-*meses-correto.cjs # 🌴 TropicalPlayTV
├── renovar-servidor2-*meses-correto.cjs # 🕷️ SpiderTV  
├── renovar-servidor3-*meses-correto.cjs # ⭐ Premium Server
└── package.json                    # 📦 Dependências
```

## 🏆 Resultado

Sistema 100% funcional e testado com navegação dinâmica inteligente!
