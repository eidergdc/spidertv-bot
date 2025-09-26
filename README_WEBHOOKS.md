# 🚀 SpiderTV Bot - Comandos Webhook via Make

Agora você pode enviar comandos de renovação diretamente via `make` usando webhooks HTTP!

## 🎯 Comandos de Renovação via Webhook

### Renovação Personalizada
```bash
# Renovar nos 3 servidores
make renew-3servidores CODE=648718886 MONTHS=6

# Renovar servidor específico
make renew-servidor1 CODE=648718886 MONTHS=1    # TropicalPlayTV
make renew-servidor2 CODE=648718886 MONTHS=3    # SpiderTV  
make renew-servidor3 CODE=648718886 MONTHS=12   # Premium Server
```

### Renovação Rápida (Cliente Padrão: 648718886)
```bash
make quick-1mes     # 1 mês nos 3 servidores
make quick-3meses   # 3 meses nos 3 servidores
make quick-6meses   # 6 meses nos 3 servidores
make quick-12meses  # 12 meses nos 3 servidores
```

## 🔍 Comandos de Monitoramento

```bash
make check-health   # Verificar saúde do servidor via webhook
make check-queue    # Ver fila de renovações via webhook
make open-web       # Abrir interface web no navegador
```

## 🧪 Comandos de Teste

```bash
make test-webhook              # Teste simples de webhook
make test-multiple-webhooks    # Teste de múltiplos webhooks simultâneos
```

## 📋 Exemplos Práticos

### Exemplo 1: Renovar cliente específico por 6 meses
```bash
make renew-3servidores CODE=359503850 MONTHS=6
```

### Exemplo 2: Renovar apenas no SpiderTV por 3 meses
```bash
make renew-servidor2 CODE=359503850 MONTHS=3
```

### Exemplo 3: Renovação rápida de 1 mês
```bash
make quick-1mes
```

### Exemplo 4: Verificar status da fila
```bash
make check-queue
```

## 🔄 Como Funciona

1. **Servidor HTTP** - O `server-3-servidores.js` está rodando na porta 8080
2. **Webhooks** - Os comandos `make` enviam requisições HTTP POST
3. **Sistema de Fila** - Renovações são processadas sequencialmente
4. **Interface Web** - Disponível em http://localhost:8080

## 📊 Resposta dos Webhooks

### Sucesso (HTTP 200)
```json
{
  "ok": true,
  "message": "Cliente 648718886 renovado com sucesso nos 3 servidores",
  "cliente": "648718886",
  "meses": 6,
  "servidores": ["TropicalPlayTV", "SpiderTV", "Premium Server"],
  "filaRestante": 0
}
```

### Erro (HTTP 400/500)
```json
{
  "ok": false,
  "error": "Código do cliente é obrigatório",
  "cliente": "648718886",
  "meses": 6,
  "filaRestante": 1
}
```

## 🎯 Parâmetros Disponíveis

| Parâmetro | Valores | Descrição |
|-----------|---------|-----------|
| `CODE` | Qualquer número | Código do cliente |
| `MONTHS` | 1, 3, 6, 12 | Período de renovação |
| `HOST` | localhost (padrão) | Endereço do servidor |
| `PORT` | 8080 (padrão) | Porta do servidor |

## 🔧 Configuração Avançada

### Alterar host/porta
```bash
make renew-3servidores CODE=648718886 MONTHS=6 HOST=192.168.1.100 PORT=9000
```

### Usar com servidor remoto
```bash
make renew-servidor2 CODE=648718886 MONTHS=3 HOST=meuservidor.com PORT=80
```

## 🚨 Validações

- **Código obrigatório**: O campo `CODE` é obrigatório
- **Meses válidos**: Apenas 1, 3, 6, 12 meses são aceitos
- **Sistema de fila**: Renovações simultâneas são enfileiradas automaticamente
- **Timeout**: Webhooks têm timeout de 30 segundos

## 🎉 Vantagens dos Webhooks via Make

✅ **Simplicidade** - Comandos fáceis de lembrar  
✅ **Automação** - Pode ser usado em scripts  
✅ **Flexibilidade** - Parâmetros personalizáveis  
✅ **Monitoramento** - Status em tempo real  
✅ **Sistema de Fila** - Evita conflitos  
✅ **Interface Web** - Alternativa visual  

## 📝 Logs e Debug

### Ver logs do servidor
```bash
# O servidor mostra logs em tempo real
make start
```

### Verificar se webhook foi processado
```bash
make check-queue
```

### Testar conectividade
```bash
make check-health
```

## 🔗 Integração com Outros Sistemas

### Usar em scripts bash
```bash
#!/bin/bash
# Script de renovação em lote

CLIENTES=("648718886" "359503850" "123456789")

for cliente in "${CLIENTES[@]}"; do
    echo "Renovando cliente: $cliente"
    make renew-3servidores CODE=$cliente MONTHS=6
    sleep 5  # Aguardar 5 segundos entre renovações
done
```

### Usar com cron (agendamento)
```bash
# Renovar cliente específico todo dia 1º do mês às 9h
0 9 1 * * cd /path/to/spidertv-bot && make quick-6meses
```

### Usar com CI/CD
```yaml
# GitHub Actions exemplo
- name: Renovar clientes
  run: |
    make start &
    sleep 10
    make renew-3servidores CODE=648718886 MONTHS=6
    make stop
```

---

🕷️ **SpiderTV Bot v1.0.0** - Webhooks implementados com sucesso!
