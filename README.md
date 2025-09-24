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
curl -X POST http://localhost:8080/activate/spidertv   -H "Content-Type: application/json"   -d '{"code":"648718886","plan":"PLANO COMPLETO","expiresAt":"2026-05-04"}'
```

> Ajuste os seletores marcados como **TODO** no `index.js` conforme sua UI (textos de botões/inputs).
