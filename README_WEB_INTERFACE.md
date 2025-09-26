# 🕷️ SpiderTV Bot - Interface Web

Interface web moderna para renovação de clientes nos servidores TropicalPlayTV, SpiderTV e Premium Server.

## 🚀 Como Usar

### 1. Comandos Make Disponíveis

```bash
# Ver todos os comandos disponíveis
make help

# Instalar dependências
make install

# Iniciar servidor
make start

# Verificar status do servidor
make health

# Ver fila de renovações
make status

# Parar servidor
make stop

# Limpar arquivos temporários
make clean
```

### 2. Acessar Interface Web

Após iniciar o servidor com `make start`, acesse:

**🌐 Interface Web:** http://localhost:8080

### 3. Funcionalidades da Interface

#### 🎯 Renovação nos 3 Servidores
- Renova automaticamente em todos os servidores
- TropicalPlayTV → SpiderTV → Premium Server
- Sistema de fila para evitar conflitos

#### 🎯 Renovação Individual
- **Servidor 1:** TropicalPlayTV
- **Servidor 2:** SpiderTV  
- **Servidor 3:** Premium Server

#### 📋 Monitoramento
- Status do servidor em tempo real
- Fila de renovações
- Log de atividades
- Atualização automática

### 4. Períodos Disponíveis

- ✅ **1 Mês**
- ✅ **3 Meses**
- ✅ **6 Meses**
- ✅ **12 Meses**

## 🔧 API Endpoints

### Health Check
```bash
GET /health
```

### Renovação nos 3 Servidores
```bash
POST /activate/3servidores
Content-Type: application/json

{
  "code": "648718886",
  "months": 6
}
```

### Renovação Individual
```bash
# Servidor 1 - TropicalPlayTV
POST /activate/servidor1

# Servidor 2 - SpiderTV
POST /activate/servidor2

# Servidor 3 - Premium Server
POST /activate/servidor3
```

### Status da Fila
```bash
GET /fila
```

## 📁 Estrutura de Arquivos

```
spidertv-bot/
├── public/                 # Interface Web
│   ├── index.html         # Página principal
│   ├── css/
│   │   └── style.css      # Estilos da interface
│   └── js/
│       └── app.js         # JavaScript da interface
├── server-3-servidores.js # Servidor HTTP principal
├── Makefile              # Comandos make
└── README_WEB_INTERFACE.md
```

## 🎨 Características da Interface

### ✨ Design Moderno
- Interface responsiva
- Gradientes e animações
- Tema escuro/claro
- Ícones intuitivos

### 🔄 Funcionalidades Avançadas
- Sistema de fila visual
- Log de atividades em tempo real
- Notificações de sucesso/erro
- Modal de loading
- Auto-refresh dos dados

### ⌨️ Atalhos de Teclado
- **Ctrl + Enter:** Focar no campo de código
- **Ctrl + R:** Atualizar fila
- **Escape:** Fechar modal

## 🛠️ Exemplos de Uso

### Via Interface Web
1. Acesse http://localhost:8080
2. Digite o código do cliente
3. Selecione o período
4. Clique em "Renovar"

### Via Comando Make
```bash
# Iniciar servidor
make start

# Em outro terminal, verificar status
make health

# Ver fila
make status
```

### Via cURL
```bash
# Renovar nos 3 servidores
curl -X POST http://localhost:8080/activate/3servidores \
  -H "Content-Type: application/json" \
  -d '{"code":"648718886","months":6}'

# Verificar fila
curl http://localhost:8080/fila
```

## 🔒 Sistema de Fila

- **Processamento sequencial:** Uma renovação por vez
- **Fila automática:** Requisições simultâneas são enfileiradas
- **Status em tempo real:** Acompanhe o progresso
- **Evita conflitos:** Previne problemas de concorrência

## 📱 Responsividade

A interface se adapta automaticamente a:
- 🖥️ **Desktop:** Layout em grid
- 📱 **Mobile:** Layout em coluna única
- 📟 **Tablet:** Layout adaptativo

## 🎯 Próximas Funcionalidades

- [ ] Histórico de renovações
- [ ] Relatórios em PDF
- [ ] Notificações push
- [ ] Tema escuro/claro
- [ ] Múltiplos idiomas
- [ ] Dashboard analytics

## 🐛 Solução de Problemas

### Servidor não inicia
```bash
# Verificar se a porta 8080 está livre
lsof -i :8080

# Instalar dependências
make install
```

### Interface não carrega
```bash
# Verificar se o servidor está rodando
make health

# Limpar cache do navegador
Ctrl + F5 (ou Cmd + Shift + R no Mac)
```

### Renovação falha
```bash
# Verificar logs no terminal
# Verificar se os scripts .cjs existem
# Verificar variáveis de ambiente
```

## 📞 Suporte

- **Desenvolvedor:** eidergdc
- **Versão:** 1.0.0
- **Licença:** MIT

---

🕷️ **SpiderTV Bot** - Automação inteligente para renovação de clientes
