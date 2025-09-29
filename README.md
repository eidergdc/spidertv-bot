# SpiderTV Bot (Playwright + Express)

Automação de renovação no painel SpiderTV com **login persistente** e endpoint HTTP.

## Como rodar

```bash
npm install
npx playwright install --with-deps
node index.js
```

Teste:

```bash
# Verificar status e fila
curl http://localhost:8080/health
curl http://localhost:8080/fila

# Renovar cliente (sistema de fila ativo)
curl -X POST http://localhost:8080/activate/spidertv \
  -H "Content-Type: application/json" \
  -d '{"code":"648718886","months":1}'
```

> **Sistema de Fila Ativo:** O bot processa uma renovação por vez para evitar conflitos entre navegadores simultâneos.

> Ajuste os seletores marcados como **TODO** no `index.js` conforme sua UI (textos de botões/inputs).

> Este projeto foi simplificado para funcionar apenas com o Servidor 1 (TropicalPlayTV). Todo o código e arquivos relacionados aos outros servidores foram removidos para maior leveza e foco.
