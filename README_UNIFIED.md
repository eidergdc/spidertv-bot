# 🕷️ SpiderTV Bot Unificado

Bot de automação para renovação de clientes em **dois servidores**:
- **Servidor 1**: TropicalPlayTV (https://painel.tropicalplaytv.com)
- **Servidor 2**: SpiderTV (https://spidertv.sigma.st)

## 🚀 Funcionalidades

### ✅ Servidor 1 (TropicalPlayTV)
- Login automático no painel
- Renovação via API nativa
- Busca de clientes
- Fallback para interface web
- Persistência de sessão PHPSESSID

### ✅ Servidor 2 (SpiderTV)
- Login automático na interface moderna
- Navegação inteligente
- Busca e renovação via interface web
- Persistência de cookies de sessão
- Tratamento de modais automático

### 🔄 Funcionalidades Unificadas
- **Renovação simultânea** em ambos servidores
- **Health checks** individuais e gerais
- **API REST** com endpoints específicos
- **Logs detalhados** para debugging
- **Screenshots automáticos** em caso de erro

## 📋 Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn
- Dependências: `playwright`, `express`, `dotenv`

## 🔧 Instalação

1. **Clone o repositório**:
```bash
git clone <seu-repositorio>
cd spidertv-bot
```

2. **Instale as dependências**:
```bash
npm install
npx playwright install --with-deps
```

3. **Configure as variáveis de ambiente**:
```bash
cp config.example.env .env
# Edite o arquivo .env com suas credenciais
```

4. **Execute o bot**:
```bash
node unified-bot.js
```

## ⚙️ Configuração

### Arquivo `.env`

```env
# Configurações Gerais
PORT=8080

# Servidor 1 - TropicalPlayTV
BASE_URL=https://painel.tropicalplaytv.com
SERVER1_USER=seu_usuario
SERVER1_PASS=sua_senha

# Servidor 2 - SpiderTV
SERVER2_BASE_URL=https://spidertv.sigma.st
SERVER2_USER=tropicalplay
SERVER2_PASS=Virginia13
```

## 🌐 API Endpoints

### Health Checks

```bash
# Status geral de ambos servidores
GET /health

# Status específico do Servidor 1
GET /health/server1

# Status específico do Servidor 2
GET /health/server2
```

### Renovação de Clientes

```bash
# Renovar apenas no Servidor 1 (TropicalPlayTV)
POST /activate/server1
Content-Type: application/json
{
  "code": "648718886",
  "months": 1
}

# Renovar apenas no Servidor 2 (SpiderTV)
POST /activate/server2
Content-Type: application/json
{
  "code": "155357738",
  "months": 1
}

# Renovar em AMBOS servidores simultaneamente
POST /activate/both
Content-Type: application/json
{
  "code": "123456789",
  "months": 1
}
```

## 📝 Exemplos de Uso

### 1. Verificar Status dos Servidores

```bash
curl http://localhost:8080/health
```

**Resposta:**
```json
{
  "status": "ok",
  "servers": {
    "server1": {
      "name": "TropicalPlayTV",
      "url": "https://painel.tropicalplaytv.com",
      "hasSession": true
    },
    "server2": {
      "name": "SpiderTV",
      "url": "https://spidertv.sigma.st",
      "hasSession": true
    }
  }
}
```

### 2. Renovar Cliente no Servidor 1

```bash
curl -X POST http://localhost:8080/activate/server1 \
  -H "Content-Type: application/json" \
  -d '{"code":"648718886","months":1}'
```

### 3. Renovar Cliente no Servidor 2

```bash
curl -X POST http://localhost:8080/activate/server2 \
  -H "Content-Type: application/json" \
  -d '{"code":"155357738","months":3}'
```

### 4. Renovar em Ambos Servidores

```bash
curl -X POST http://localhost:8080/activate/both \
  -H "Content-Type: application/json" \
  -d '{"code":"123456789","months":1}'
```

**Resposta:**
```json
{
  "ok": true,
  "code": "123456789",
  "months": 1,
  "results": {
    "server1": {
      "success": true,
      "clientId": "123456789",
      "months": 1
    },
    "server2": {
      "success": true,
      "clientId": "123456789",
      "months": 1
    },
    "errors": []
  },
  "summary": {
    "server1": "success",
    "server2": "success",
    "totalErrors": 0
  }
}
```

## 🔍 Debugging

### Screenshots Automáticos
Em caso de erro, o bot salva screenshots em `tmp/`:
- `server1-login-fail-TIMESTAMP.png`
- `server2-login-fail-TIMESTAMP.png`
- `server1-renew-fail-TIMESTAMP.png`
- `server2-renew-fail-TIMESTAMP.png`

### Logs Detalhados
O bot exibe logs coloridos no console:
- 🔐 Login em progresso
- ✅ Operações bem-sucedidas
- ❌ Erros encontrados
- 🔄 Renovações em andamento

## 🛡️ Segurança

- **Credenciais**: Armazenadas em variáveis de ambiente
- **Sessões**: Persistidas localmente em arquivos JSON
- **Validação**: Testa sessões antes de usar
- **Retry**: Re-login automático se sessão expirar

## 📁 Estrutura de Arquivos

```
spidertv-bot/
├── unified-bot.js          # Bot principal unificado
├── server2.js              # Bot específico do Servidor 2
├── index.js                # Bot original do Servidor 1
├── bot.js                  # Implementação legado (Puppeteer)
├── config.example.env      # Template de configuração
├── server1_session.json    # Sessão do Servidor 1
├── server2_session.json    # Sessão do Servidor 2
├── tmp/                    # Screenshots de debug
└── README_UNIFIED.md       # Esta documentação
```

## 🚨 Troubleshooting

### Erro: "Login falhou"
- Verifique as credenciais no arquivo `.env`
- Confirme se os sites estão acessíveis
- Verifique se não há CAPTCHA ou 2FA

### Erro: "Cliente não encontrado"
- Confirme se o código do cliente está correto
- Verifique se o cliente existe no servidor específico
- Tente buscar manualmente no painel

### Erro: "Sessão inválida"
- Delete os arquivos `server*_session.json`
- Reinicie o bot para forçar novo login
- Verifique se as credenciais estão corretas

### Erro: "Botão de renovação não encontrado"
- A interface pode ter mudado
- Verifique os screenshots em `tmp/`
- Pode ser necessário atualizar os seletores

## 🤝 Contribuição

Para melhorias ou correções:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Abra um Pull Request

## 📄 Licença

Este projeto é para uso interno e automação de tarefas administrativas.

---

**Desenvolvido para automação de renovação de clientes em múltiplos painéis IPTV**

🔧 **Versão**: 2.0.0  
📅 **Última atualização**: Janeiro 2025  
👨‍💻 **Desenvolvedor**: Eider Gonçalves
