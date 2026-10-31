const db = require('../database/db');

const associacaoController = {
  // Cenário 1 e 2: Associar Fornecedor a Produto
  async associar(req, res) {
    try {
      const { produtoId } = req.params;
      const { fornecedor_id } = req.body;

      if (!fornecedor_id) {
        return res.status(400).json({ mensagem: 'O ID do fornecedor é obrigatório.' });
      }

      // Verificar se o produto existe
      const produto = await db.get('SELECT id FROM produtos WHERE id = ?', [produtoId]);
      if (!produto) {
        return res.status(404).json({ mensagem: 'Produto não encontrado.' });
      }

      // Verificar se o fornecedor existe
      const fornecedor = await db.get('SELECT id FROM fornecedores WHERE id = ?', [fornecedor_id]);
      if (!fornecedor) {
        return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
      }

      // Cenário 2: Tentando associar fornecedor já associado
      const associacaoExistente = await db.get(
        'SELECT * FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?',
        [produtoId, fornecedor_id]
      );

      if (associacaoExistente) {
        return res.status(400).json({
          mensagem: 'Fornecedor já está associado a este produto!',
        });
      }

      // Cenário 1: Associando com sucesso
      await db.run(
        'INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)',
        [produtoId, fornecedor_id]
      );

      return res.status(201).json({
        mensagem: 'Fornecedor associado com sucesso ao produto!',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao associar fornecedor.' });
    }
  },

  // Cenário 3: Desassociar Fornecedor de Produto
  async desassociar(req, res) {
    try {
      const { produtoId, fornecedorId } = req.params;

      const associacao = await db.get(
        'SELECT * FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?',
        [produtoId, fornecedorId]
      );

      if (!associacao) {
        return res.status(404).json({
          mensagem: 'Associação entre fornecedor e produto não encontrada.',
        });
      }

      await db.run(
        'DELETE FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?',
        [produtoId, fornecedorId]
      );

      return res.status(200).json({
        mensagem: 'Fornecedor desassociado com sucesso!',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao desassociar fornecedor.' });
    }
  },

  // Listar fornecedores associados a um produto
  async listarFornecedoresDoProduto(req, res) {
    try {
      const { produtoId } = req.params;

      const produto = await db.get('SELECT id FROM produtos WHERE id = ?', [produtoId]);
      if (!produto) {
        return res.status(404).json({ mensagem: 'Produto não encontrado.' });
      }

      const fornecedores = await db.all(
        `SELECT f.id, f.nome_empresa, f.cnpj, f.telefone, f.email, f.contato_principal, pf.created_at as associado_em
         FROM fornecedores f
         INNER JOIN produto_fornecedor pf ON pf.fornecedor_id = f.id
         WHERE pf.produto_id = ?
         ORDER BY f.nome_empresa ASC`,
        [produtoId]
      );

      return res.status(200).json(fornecedores);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno ao listar fornecedores do produto.' });
    }
  },

  // Listar produtos associados a um fornecedor
  async listarProdutosDoFornecedor(req, res) {
    try {
      const { fornecedorId } = req.params;

      const fornecedor = await db.get('SELECT id FROM fornecedores WHERE id = ?', [fornecedorId]);
      if (!fornecedor) {
        return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
      }

      const produtos = await db.all(
        `SELECT p.id, p.nome, p.codigo_barras, p.descricao, p.quantidade_estoque, p.categoria, p.data_validade, p.imagem, pf.created_at as associado_em
         FROM produtos p
         INNER JOIN produto_fornecedor pf ON pf.produto_id = p.id
         WHERE pf.fornecedor_id = ?
         ORDER BY p.nome ASC`,
        [fornecedorId]
      );

      return res.status(200).json(produtos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno ao listar produtos do fornecedor.' });
    }
  },
};

module.exports = associacaoController;
