# 🕷️ RESUMO COMPLETO - SpiderTV Bot para Digital Ocean

## 📋 O QUE É O BOT

**SpiderTV Bot** é um sistema de automação para renovação de clientes em 3 servidores IPTV:
- **Servidor 1:** TropicalPlayTV (https://painel.tropicalplaytv.com)
- **Servidor 2:** SpiderTV (https://spidertv.sigma.st)  
- **Servidor 3:** Premium Server

## 🏗️ ARQUITETURA DO SISTEMA

### Tecnologias Utilizadas:
- **Node.js** (ES Modules)
- **Express.js** (Servidor HTTP/API)
- **Playwright** (Automação de navegador)
- **Puppeteer** (Backup para automação)

### Estrutura Principal:
```
spidertv-bot/
├── server-3-servidores.js          # 🚀 Servidor HTTP principal (porta 8080)
├── package.json                    # 📦 Dependências Node.js
├── Makefile                        # 🛠️ Comandos automatizados
├── config.example.env              # ⚙️ Configurações (copiar para .env)
├── renovar-3-servidores-sequencial.cjs  # 🎯 Script principal (3 servidores)
├── renovar-servidor1-*meses-correto.cjs # 🌴 Scripts TropicalPlayTV
├── renovar-servidor2-*meses-correto.cjs # 🕷️ Scripts SpiderTV
├── renovar-servidor3-*meses-correto.cjs # ⭐ Scripts Premium Server
└── public/                         # 🌐 Interface Web
    ├── index.html                  # Interface de usuário
    ├── css/style.css              # Estilos
    └── js/app.js                  # JavaScript frontend
```

## 🚀 FUNCIONALIDADES PRINCIPAIS

### 1. **API HTTP com Sistema de Fila**
- **Porta:** 8080
- **Sistema de Fila:** Processa uma renovação por vez (evita conflitos)
- **Endpoints principais:**
  - `POST /activate/3servidores` - Renovar nos 3 servidores
  - `POST /activate/servidor1` - TropicalPlayTV apenas
  - `POST /activate/servidor2` - SpiderTV apenas  
  - `POST /activate/servidor3` - Premium Server apenas
  - `GET /health` - Status do sistema
  - `GET /fila` - Status da fila de processamento

### 2. **Interface Web**
- Interface gráfica em `http://localhost:8080`
- Formulários para renovação
- Monitor de fila em tempo real
- Log de atividades

### 3. **Comandos Make (Makefile)**
- `make start` - Iniciar servidor
- `make renew CODE=648718886 MONTHS=6` - Renovar cliente
- `make quick-6meses` - Renovação rápida (cliente padrão)
- `make health` - Verificar status
- `make stop` - Parar servidor

## 📊 PARÂMETROS DE RENOVAÇÃO

### Entrada (JSON):
```json
{
  "code": "648718886",    // Código do cliente (obrigatório)
  "months": 6             // Período: 1, 3, 6 ou 12 meses
}
```

### Exemplo de Uso:
```bash
curl -X POST http://localhost:8080/activate/3servidores \
  -H "Content-Type: application/json" \
  -d '{"code":"648718886","months":6}'
```

## ⏱️ PERFORMANCE OTIMIZADA

- **Por servidor:** ~1.2 minutos (super otimizado)
- **Total (3 servidores):** ~4 minutos
- **Login otimizado:** Colagem direta de credenciais
- **Busca otimizada:** Colagem instantânea do código do cliente
- **Sistema de fila:** Evita conflitos em múltiplas requisições

## 🔄 SISTEMA DE FILA INTELIGENTE

### Problema Resolvido:
- Múltiplas requisições simultâneas causavam conflitos
- Navegadores concorrentes geravam falhas

### Solução Implementada:
- **Fila FIFO:** Primeira requisição entra, primeira sai
- **Processamento sequencial:** Uma renovação por vez
- **Monitoramento:** Endpoint `/fila` mostra status atual
- **Resposta imediata:** API responde instantaneamente, processa em background

## 📦 DEPENDÊNCIAS (package.json)

```json
{
  "dependencies": {
    "axios": "^1.12.2",
    "dotenv": "^16.4.5", 
    "express": "^4.19.2",
    "node-fetch": "^2.7.0",
    "playwright": "^1.46.0",
    "puppeteer": "^24.22.1"
  }
}
```

## ⚙️ CONFIGURAÇÃO NECESSÁRIA

### 1. Arquivo `.env` (baseado em config.example.env):
```env
PORT=8080
NODE_ENV=production

# Servidor 1 - TropicalPlayTV
BASE_URL=https://painel.tropicalplaytv.com
SERVER1_USER=seu_usuario_servidor1
SERVER1_PASS=sua_senha_servidor1

# Servidor 2 - SpiderTV  
SERVER2_BASE_URL=https://spidertv.sigma.st
SERVER2_USER=tropicalplay
SERVER2_PASS=Virginia13

# Configurações do Bot
DEFAULT_HEADLESS=true
RETRY_ATTEMPTS=3
RETRY_DELAY=2000
```

## 🚀 INSTALAÇÃO NO DIGITAL OCEAN

### Pré-requisitos do Sistema:
- **Ubuntu 20.04+** ou **CentOS 8+**
- **Node.js 18+**
- **npm** ou **yarn**
- **Git**
- **Dependências do Playwright:** Navegadores Chromium/Firefox

### Comandos de Instalação:
```bash
# 1. Clonar repositório
git clone https://github.com/eidergdc/spidertv-bot.git
cd spidertv-bot

# 2. Instalar dependências Node.js
npm install

# 3. Instalar navegadores do Playwright
npx playwright install --with-deps

# 4. Configurar ambiente
cp config.example.env .env
# (editar .env com credenciais reais)

# 5. Iniciar servidor
npm start
# ou
make start
```

### Portas Necessárias:
- **8080** - API HTTP principal
- **22** - SSH (administração)

### Comandos Make Disponíveis:
```bash
make help           # Ver todos os comandos
make install        # Instalar dependências  
make start          # Iniciar servidor
make stop           # Parar servidor
make health         # Verificar status
make renew CODE=648718886 MONTHS=6  # Renovar cliente
make quick-6meses   # Renovação rápida
```

## 🔧 CONFIGURAÇÃO DE PRODUÇÃO

### 1. **Process Manager (PM2):**
```bash
npm install -g pm2
pm2 start server-3-servidores.js --name "spidertv-bot"
pm2 startup
pm2 save
```

### 2. **Nginx Reverse Proxy (Opcional):**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. **Firewall (UFW):**
```bash
ufw allow 22/tcp
ufw allow 8080/tcp
ufw enable
```

## 🧪 TESTES APÓS INSTALAÇÃO

### 1. **Teste de Health:**
```bash
curl http://SEU_IP:8080/health
```

### 2. **Teste de Renovação:**
```bash
curl -X POST http://SEU_IP:8080/activate/3servidores \
  -H "Content-Type: application/json" \
  -d '{"code":"648718886","months":1}'
```

### 3. **Interface Web:**
```
http://SEU_IP:8080
```

## 📊 MONITORAMENTO

### Endpoints de Status:
- `GET /health` - Status geral do sistema
- `GET /fila` - Status da fila de processamento
- `GET /api` - Documentação dos endpoints

### Logs do Sistema:
```bash
# Via PM2
pm2 logs spidertv-bot

# Via Make
make status
```

## 🔒 SEGURANÇA

### Credenciais Sensíveis:
- Manter arquivo `.env` seguro (não versionar)
- Usar variáveis de ambiente em produção
- Configurar firewall adequadamente

### Acesso Restrito:
- API sem autenticação (adicionar se necessário)
- Interface web pública (considerar autenticação)

## 🎯 CASOS DE USO PRINCIPAIS

### 1. **Integração com Make.com:**
- Webhook automático quando cliente paga
- Renovação automática nos 3 servidores
- Sistema de fila evita conflitos

### 2. **Uso Manual:**
- Interface web para renovações pontuais
- Comandos Make para administradores
- API para integrações customizadas

### 3. **Monitoramento:**
- Dashboard web para acompanhar filas
- Logs detalhados de cada renovação
- Status em tempo real

## 🏆 VANTAGENS DO SISTEMA

✅ **Automação Completa:** Renovação nos 3 servidores automaticamente  
✅ **Sistema de Fila:** Zero conflitos em múltiplas requisições  
✅ **Performance Otimizada:** 4 minutos para 3 servidores (vs 7 min original)  
✅ **Interface Amigável:** Web UI + comandos Make + API REST  
✅ **Monitoramento:** Status em tempo real e logs detalhados  
✅ **Escalabilidade:** Pronto para múltiplos clientes simultâneos  
✅ **Manutenibilidade:** Código modular e bem documentado  

## 📞 SUPORTE

- **Desenvolvedor:** eidergdc
- **Versão:** 1.0.0
- **Licença:** MIT
- **Repositório:** https://github.com/eidergdc/spidertv-bot

---

## 🎯 RESUMO PARA CHATGPT

**"Preciso instalar este bot Node.js no Digital Ocean. É um sistema de automação que renova clientes IPTV em 3 servidores usando Playwright. Tem API REST na porta 8080, sistema de fila para múltiplas requisições, interface web e comandos Make. Principais arquivos: server-3-servidores.js (servidor principal), package.json (dependências), Makefile (comandos), config.example.env (configurações). Precisa de Node.js 18+, Playwright com navegadores, e configuração do arquivo .env com credenciais dos servidores."**
