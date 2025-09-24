# Bot de Renovação de Clientes - TropicalPlayTV

Este bot automatiza o processo de login no painel da TropicalPlayTV e renova clientes através da API.

## 🚀 Funcionalidades

- ✅ Login automático no painel
- ✅ Navegação para página de clientes
- ✅ Renovação de clientes via API
- ✅ Busca de clientes
- ✅ Suporte a execução manual ou programada

## 📋 Pré-requisitos

- Node.js instalado
- npm ou yarn
- Dependências: `puppeteer` e `axios`

## 🔧 Instalação

1. Instalar dependências:
```bash
npm install puppeteer axios
```

2. Verificar se o Chromium está instalado:
```bash
npx puppeteer browsers install
```

## 🎯 Como Usar

### Execução Direta

```bash
# Renovar cliente específico (1 mês)
node bot.js 648718886 1

# Renovar cliente específico (3 meses)
node bot.js 648718886 3
```

### Uso Programático

```javascript
const ClientRenewalBot = require('./bot');

async function example() {
    const bot = new ClientRenewalBot();

    // Renovar cliente
    const result = await bot.runRenewal('648718886', 1);

    if (result.success) {
        console.log('Cliente renovado com sucesso!');
    } else {
        console.log('Erro:', result.error);
    }

    await bot.close();
}

example();
```

## 🔐 Configuração

As credenciais estão configuradas no código:
- **Usuário**: administrador
- **Senha**: @Administrador10
- **URL Base**: https://painel.tropicalplaytv.com

## 📡 API Endpoints

### Renovar Cliente
```
GET /sys/api.php?action=renew_client_plus&client_id={ID}&months={MESES}
```

### Buscar Clientes
```
GET /sys/api.php?action=get_clients&search[value]={TERMO}
```

## ⚙️ Parâmetros

| Parâmetro | Descrição | Exemplo |
|-----------|-----------|---------|
| client_id | ID do cliente | 648718886 |
| months | Meses para renovar | 1, 3, 6, 12 |
| search | Termo de busca | eider |

## 🔍 Exemplo de Uso Avançado

```javascript
const bot = new ClientRenewalBot();

// Buscar clientes
const clientsResult = await bot.getClients('eider');
console.log('Clientes encontrados:', clientsResult.data);

// Renovar primeiro cliente encontrado
if (clientsResult.data && clientsResult.data.data && clientsResult.data.data.length > 0) {
    const firstClient = clientsResult.data.data[0];
    await bot.renewClient(firstClient.id, 1);
}

await bot.close();
```

## 🚨 Avisos

- O bot usa modo headless=false para debug (visível na tela)
- Em produção, altere para headless=true
- Mantenha as credenciais seguras
- Use apenas em ambiente controlado

## 🐛 Troubleshooting

### Erro: "Chromium not found"
```bash
npx puppeteer browsers install chrome
```

### Erro: "Login failed"
- Verifique as credenciais
- Verifique se o site está acessível
- Verifique se há CAPTCHA ou 2FA

### Erro: "Navigation timeout"
- Aumente o timeout nas configurações
- Verifique a conexão com internet

## 📝 Logs

O bot exibe logs detalhados:
- 🔐 Status do login
- 📋 Navegação entre páginas
- 🔄 Processos de renovação
- ✅ Resultados das operações
- ❌ Erros encontrados

## 🤝 Contribuição

Para melhorias ou correções, sinta-se à vontade para contribuir!

---

**Desenvolvido para automação de renovação de clientes TropicalPlayTV**
