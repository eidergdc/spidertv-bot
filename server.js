const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Simulação de fila de renovações
let fila = [];
let processando = false;

// Endpoint health para verificar status do servidor
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Endpoint para obter status da fila
app.get('/fila', (req, res) => {
  res.json({
    filaAtual: fila.length,
    processandoAtualmente: processando,
    proximosClientes: fila.slice(0, 5) // mostrar os próximos 5 clientes na fila
  });
});

// Endpoint para ativar renovação (exemplo para spidertv)
app.post('/activate/spidertv', (req, res) => {
  const { code, months } = req.body;
  if (!code || !months) {
    return res.status(400).json({ ok: false, error: 'Código e meses são obrigatórios' });
  }

  // Adicionar na fila
  fila.push({ cliente: code, meses: months, servidor: 'TropicalPlayTV' });

  // Simular processamento assíncrono da renovação
  if (!processando) {
    processarFila();
  }

  res.json({ ok: true, message: `Cliente ${code} adicionado à fila para renovação de ${months} mês(es)` });
});

async function processarFila() {
  if (fila.length === 0) {
    processando = false;
    return;
  }
  processando = true;
  const cliente = fila.shift();

  console.log(`Processando renovação do cliente ${cliente.cliente} por ${cliente.meses} mês(es)...`);

  // Simular tempo de processamento
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log(`Renovação do cliente ${cliente.cliente} concluída.`);

  // Processar próximo da fila
  processarFila();
}

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
