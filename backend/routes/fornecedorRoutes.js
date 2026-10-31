const express = require('express');
const router = express.Router();
const fornecedorController = require('../controllers/fornecedorController');
const associacaoController = require('../controllers/associacaoController');

router.get('/', fornecedorController.listar);
router.get('/:id', fornecedorController.buscarPorId);
router.post('/', fornecedorController.criar);
router.put('/:id', fornecedorController.atualizar);
router.delete('/:id', fornecedorController.excluir);

// Listar produtos associados a este fornecedor
router.get('/:fornecedorId/produtos', associacaoController.listarProdutosDoFornecedor);

module.exports = router;
