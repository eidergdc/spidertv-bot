# 🕷️ SpiderTV Bot - Makefile
# Comandos para facilitar o uso do bot de renovação

.PHONY: help start dev stop install clean test health status

# Configurações
PORT ?= 8080
HOST ?= localhost

# Comando padrão
help:
	@echo "🕷️ SpiderTV Bot - Comandos Disponíveis:"
	@echo ""
	@echo "📦 INSTALAÇÃO:"
	@echo "  make install     - Instalar dependências"
	@echo ""
	@echo "🚀 SERVIDOR:"
	@echo "  make start       - Iniciar servidor HTTP (porta $(PORT))"
	@echo "  make dev         - Iniciar em modo desenvolvimento"
	@echo "  make stop        - Parar servidor"
	@echo ""
	@echo "🔍 MONITORAMENTO:"
	@echo "  make health      - Verificar status do servidor"
	@echo "  make status      - Ver fila de renovações"
	@echo "  make check-health - Verificar saúde via webhook"
	@echo "  make check-queue  - Verificar fila via webhook"
	@echo ""
	@echo "🎯 RENOVAÇÃO PRINCIPAL (3 SERVIDORES):"
	@echo "  make renew CODE=648718886 MONTHS=6  - Renovar cliente específico"
	@echo ""
	@echo "⚡ RENOVAÇÃO RÁPIDA (cliente padrão):"
	@echo "  make quick-1mes   - 1 mês nos 3 servidores"
	@echo "  make quick-3meses - 3 meses nos 3 servidores"
	@echo "  make quick-6meses - 6 meses nos 3 servidores"
	@echo "  make quick-12meses - 12 meses nos 3 servidores"
	@echo ""
	@echo "🚀 CLIENTES ESPECÍFICOS:"
	@echo "  make renew-648718886-6meses  - Cliente 648718886"
	@echo "  make renew-359503850-3meses  - Cliente 359503850"
	@echo ""
	@echo "🧪 TESTES:"
	@echo "  make test         - Teste básico do servidor"
	@echo "  make test-webhook - Teste de webhook simples"
	@echo "  make test-multiple-webhooks - Teste de múltiplos webhooks"
	@echo ""
	@echo "🧹 LIMPEZA:"
	@echo "  make clean       - Limpar arquivos temporários"
	@echo ""
	@echo "🌐 ACESSO:"
	@echo "  make open-web    - Abrir interface web"
	@echo "  Interface Web: http://$(HOST):$(PORT)"
	@echo "  API Health: http://$(HOST):$(PORT)/health"

# Instalar dependências
install:
	@echo "📦 Instalando dependências..."
	npm install
	@echo "✅ Dependências instaladas!"

# Iniciar servidor
start:
	@echo "🚀 Iniciando SpiderTV Bot na porta $(PORT)..."
	@echo "🌐 Acesse: http://$(HOST):$(PORT)"
	npm start

# Modo desenvolvimento
dev:
	@echo "🔧 Iniciando em modo desenvolvimento..."
	npm run dev

# Parar servidor (mata processos Node.js do projeto)
stop:
	@echo "🛑 Parando servidor..."
	@pkill -f "server-3-servidores.js" || echo "Nenhum servidor rodando"
	@echo "✅ Servidor parado!"

# Verificar saúde do servidor
health:
	@echo "🔍 Verificando status do servidor..."
	@curl -s http://$(HOST):$(PORT)/health | jq '.' || echo "❌ Servidor não está respondendo"

# Ver status da fila
status:
	@echo "📋 Status da fila de renovações..."
	@curl -s http://$(HOST):$(PORT)/fila | jq '.' || echo "❌ Não foi possível acessar a fila"

# Limpar arquivos temporários
clean:
	@echo "🧹 Limpando arquivos temporários..."
	@rm -f *.json.bak
	@rm -f server*_session.json.backup
	@rm -rf node_modules/.cache
	@echo "✅ Limpeza concluída!"

# Teste básico
test:
	@echo "🧪 Executando teste básico..."
	@echo "📡 Testando conexão com o servidor..."
	@curl -s http://$(HOST):$(PORT)/health > /dev/null && echo "✅ Servidor OK" || echo "❌ Servidor não responde"

# 🚀 COMANDOS DE RENOVAÇÃO VIA WEBHOOK (MAKE)
# Uso: make renew-3servidores CODE=648718886 MONTHS=6

# Renovação nos 3 servidores
renew-3servidores:
	@echo "🎯 Enviando webhook para renovação nos 3 servidores..."
	@echo "📋 Cliente: $(CODE) | Período: $(MONTHS) meses"
	@curl -X POST http://$(HOST):$(PORT)/activate/3servidores \
		-H "Content-Type: application/json" \
		-d '{"code":"$(CODE)","months":$(MONTHS)}' \
		-w "\n📊 Status: %{http_code} | Tempo: %{time_total}s\n" \
		|| echo "❌ Erro ao enviar webhook"

# Renovação Servidor 1 - TropicalPlayTV
renew-servidor1:
	@echo "🌴 Enviando webhook para TropicalPlayTV..."
	@echo "📋 Cliente: $(CODE) | Período: $(MONTHS) meses"
	@curl -X POST http://$(HOST):$(PORT)/activate/servidor1 \
		-H "Content-Type: application/json" \
		-d '{"code":"$(CODE)","months":$(MONTHS)}' \
		-w "\n📊 Status: %{http_code} | Tempo: %{time_total}s\n" \
		|| echo "❌ Erro ao enviar webhook"

# Renovação Servidor 2 - SpiderTV
renew-servidor2:
	@echo "🕷️ Enviando webhook para SpiderTV..."
	@echo "📋 Cliente: $(CODE) | Período: $(MONTHS) meses"
	@curl -X POST http://$(HOST):$(PORT)/activate/servidor2 \
		-H "Content-Type: application/json" \
		-d '{"code":"$(CODE)","months":$(MONTHS)}' \
		-w "\n📊 Status: %{http_code} | Tempo: %{time_total}s\n" \
		|| echo "❌ Erro ao enviar webhook"

# Renovação Servidor 3 - Premium Server
renew-servidor3:
	@echo "⭐ Enviando webhook para Premium Server..."
	@echo "📋 Cliente: $(CODE) | Período: $(MONTHS) meses"
	@curl -X POST http://$(HOST):$(PORT)/activate/servidor3 \
		-H "Content-Type: application/json" \
		-d '{"code":"$(CODE)","months":$(MONTHS)}' \
		-w "\n📊 Status: %{http_code} | Tempo: %{time_total}s\n" \
		|| echo "❌ Erro ao enviar webhook"

# 🎯 COMANDOS PRINCIPAIS DE RENOVAÇÃO (3 SERVIDORES)
# Uso principal: make renew CODE=648718886 MONTHS=6

# Comando principal de renovação (sempre nos 3 servidores)
renew:
	@echo "🎯 Renovando nos 3 servidores via webhook..."
	@echo "📋 Cliente: $(CODE) | Período: $(MONTHS) meses"
	@echo "🌐 TropicalPlayTV + SpiderTV + Premium Server"
	@curl -X POST http://$(HOST):$(PORT)/activate/3servidores \
		-H "Content-Type: application/json" \
		-d '{"code":"$(CODE)","months":$(MONTHS)}' \
		-w "\n📊 Status: %{http_code} | Tempo: %{time_total}s\n" \
		|| echo "❌ Erro ao enviar webhook"

# 📋 COMANDOS DE RENOVAÇÃO RÁPIDA (cliente padrão: 648718886)

# Renovação rápida - 1 mês nos 3 servidores
quick-1mes:
	@echo "⚡ Renovação rápida: 1 mês nos 3 servidores"
	@make renew CODE=648718886 MONTHS=1

# Renovação rápida - 3 meses nos 3 servidores  
quick-3meses:
	@echo "⚡ Renovação rápida: 3 meses nos 3 servidores"
	@make renew CODE=648718886 MONTHS=3

# Renovação rápida - 6 meses nos 3 servidores
quick-6meses:
	@echo "⚡ Renovação rápida: 6 meses nos 3 servidores"
	@make renew CODE=648718886 MONTHS=6

# Renovação rápida - 12 meses nos 3 servidores
quick-12meses:
	@echo "⚡ Renovação rápida: 12 meses nos 3 servidores"
	@make renew CODE=648718886 MONTHS=12

# 🚀 COMANDOS ESPECÍFICOS PARA CLIENTES COMUNS

# Cliente 648718886 (padrão)
renew-648718886-1mes:
	@make renew CODE=648718886 MONTHS=1

renew-648718886-3meses:
	@make renew CODE=648718886 MONTHS=3

renew-648718886-6meses:
	@make renew CODE=648718886 MONTHS=6

renew-648718886-12meses:
	@make renew CODE=648718886 MONTHS=12

# Cliente 359503850
renew-359503850-1mes:
	@make renew CODE=359503850 MONTHS=1

renew-359503850-3meses:
	@make renew CODE=359503850 MONTHS=3

renew-359503850-6meses:
	@make renew CODE=359503850 MONTHS=6

renew-359503850-12meses:
	@make renew CODE=359503850 MONTHS=12

# 🔄 COMANDOS DE MONITORAMENTO VIA WEBHOOK

# Verificar fila via webhook
check-queue:
	@echo "📋 Verificando fila de renovações..."
	@curl -s http://$(HOST):$(PORT)/fila | jq '.' || echo "❌ Erro ao acessar fila"

# Verificar saúde via webhook
check-health:
	@echo "🔍 Verificando saúde do servidor..."
	@curl -s http://$(HOST):$(PORT)/health | jq '.' || echo "❌ Servidor não responde"

# Abrir interface web
open-web:
	@echo "🌐 Abrindo interface web..."
	@open http://$(HOST):$(PORT) || echo "❌ Erro ao abrir navegador"

# 📊 COMANDOS DE TESTE DE WEBHOOK

# Teste de webhook simples
test-webhook:
	@echo "🧪 Testando webhook básico..."
	@curl -X POST http://$(HOST):$(PORT)/activate/servidor2 \
		-H "Content-Type: application/json" \
		-d '{"code":"123456789","months":1}' \
		-w "\n📊 Status: %{http_code}\n" \
		|| echo "❌ Teste falhou"

# Teste de múltiplos webhooks (simular carga)
test-multiple-webhooks:
	@echo "🔄 Testando múltiplos webhooks..."
	@for i in 1 2 3; do \
		echo "📤 Enviando webhook $$i/3..."; \
		curl -X POST http://$(HOST):$(PORT)/activate/servidor1 \
			-H "Content-Type: application/json" \
			-d "{\"code\":\"12345678$$i\",\"months\":1}" \
			-w "\n📊 Webhook $$i - Status: %{http_code}\n" & \
	done; \
	wait; \
	echo "✅ Todos os webhooks enviados!"
