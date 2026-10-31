const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const associacaoController = require('../controllers/associacaoController');
const upload = require('../utils/upload');

router.get('/', produtoController.listar);
router.get('/:id', produtoController.buscarPorId);
router.post('/', upload.single('imagem'), produtoController.criar);
router.put('/:id', upload.single('imagem'), produtoController.atualizar);
router.delete('/:id', produtoController.excluir);

// Rotas de Associação N:N Produto <-> Fornecedor
router.get('/:produtoId/fornecedores', associacaoController.listarFornecedoresDoProduto);
router.post('/:produtoId/fornecedores', associacaoController.associar);
router.delete('/:produtoId/fornecedores/:fornecedorId', associacaoController.desassociar);

module.exports = router;
