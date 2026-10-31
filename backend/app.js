const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./database/db');
const fornecedorRoutes = require('./routes/fornecedorRoutes');
const produtoRoutes = require('./routes/produtoRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos de upload
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Rota raiz inicial
app.get('/', (req, res) => {
  res.status(200).send('Olá, Mundo!');
});

// Rotas da API
app.use('/fornecedores', fornecedorRoutes);
app.use('/produtos', produtoRoutes);

// Middleware para tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err);
  if (err.message && err.message.includes('Formato de arquivo inválido')) {
    return res.status(400).json({ mensagem: err.message });
  }
  return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  initDb()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}/`);
      });
    })
    .catch((err) => {
      console.error('Falha ao inicializar o banco de dados:', err);
      process.exit(1);
    });
}

module.exports = app;
