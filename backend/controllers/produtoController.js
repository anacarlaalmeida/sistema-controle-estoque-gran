const db = require('../database/db');
const { validateProduto } = require('../utils/validators');

const produtoController = {
  async listar(req, res) {
    try {
      const produtos = await db.all('SELECT * FROM produtos ORDER BY id DESC');
      return res.status(200).json(produtos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao listar produtos.' });
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const produto = await db.get('SELECT * FROM produtos WHERE id = ?', [id]);
      if (!produto) {
        return res.status(404).json({ mensagem: 'Produto não encontrado.' });
      }

      // Buscar fornecedores associados
      const fornecedores = await db.all(
        `SELECT f.id, f.nome_empresa, f.cnpj, f.telefone, f.email
         FROM fornecedores f
         INNER JOIN produto_fornecedor pf ON pf.fornecedor_id = f.id
         WHERE pf.produto_id = ?`,
        [id]
      );

      return res.status(200).json({
        ...produto,
        fornecedores,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao buscar produto.' });
    }
  },

  async criar(req, res) {
    try {
      const {
        nome,
        codigo_barras,
        descricao,
        quantidade_estoque,
        categoria,
        data_validade,
      } = req.body;

      // Suporte a upload de arquivo ou string de imagem
      let imagem = req.body.imagem || null;
      if (req.file) {
        imagem = `/uploads/${req.file.filename}`;
      }

      // Validação de dados
      const { valido, erros } = validateProduto({
        nome,
        codigo_barras,
        descricao,
        quantidade_estoque,
        categoria,
        data_validade,
      });

      if (!valido) {
        return res.status(400).json({
          mensagem: 'Dados inválidos.',
          erros,
        });
      }

      const codigoTrimmed = codigo_barras && codigo_barras.trim() !== '' ? codigo_barras.trim() : null;

      // Verificação de código de barras duplicado
      if (codigoTrimmed) {
        const produtoExistente = await db.get('SELECT id FROM produtos WHERE codigo_barras = ?', [codigoTrimmed]);
        if (produtoExistente) {
          return res.status(400).json({
            mensagem: 'Produto com este código de barras já está cadastrado!',
          });
        }
      }

      const qtd = quantidade_estoque !== undefined && quantidade_estoque !== null && quantidade_estoque !== ''
        ? parseInt(quantidade_estoque, 10)
        : 0;

      const resultado = await db.run(
        `INSERT INTO produtos (nome, codigo_barras, descricao, quantidade_estoque, categoria, data_validade, imagem)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          nome.trim(),
          codigoTrimmed,
          descricao.trim(),
          qtd,
          categoria.trim(),
          data_validade ? data_validade.trim() : null,
          imagem,
        ]
      );

      const novoProduto = await db.get('SELECT * FROM produtos WHERE id = ?', [resultado.id]);

      return res.status(201).json({
        mensagem: 'Produto cadastrado com sucesso!',
        produto: novoProduto,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao cadastrar produto.' });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        codigo_barras,
        descricao,
        quantidade_estoque,
        categoria,
        data_validade,
      } = req.body;

      const produtoAtual = await db.get('SELECT * FROM produtos WHERE id = ?', [id]);
      if (!produtoAtual) {
        return res.status(404).json({ mensagem: 'Produto não encontrado.' });
      }

      let imagem = produtoAtual.imagem;
      if (req.file) {
        imagem = `/uploads/${req.file.filename}`;
      } else if (req.body.imagem !== undefined) {
        imagem = req.body.imagem;
      }

      const { valido, erros } = validateProduto({
        nome,
        codigo_barras,
        descricao,
        quantidade_estoque,
        categoria,
        data_validade,
      });

      if (!valido) {
        return res.status(400).json({
          mensagem: 'Dados inválidos.',
          erros,
        });
      }

      const codigoTrimmed = codigo_barras && codigo_barras.trim() !== '' ? codigo_barras.trim() : null;

      if (codigoTrimmed && codigoTrimmed !== produtoAtual.codigo_barras) {
        const duplicado = await db.get('SELECT id FROM produtos WHERE codigo_barras = ? AND id != ?', [codigoTrimmed, id]);
        if (duplicado) {
          return res.status(400).json({
            mensagem: 'Produto com este código de barras já está cadastrado!',
          });
        }
      }

      const qtd = quantidade_estoque !== undefined && quantidade_estoque !== null && quantidade_estoque !== ''
        ? parseInt(quantidade_estoque, 10)
        : 0;

      await db.run(
        `UPDATE produtos
         SET nome = ?, codigo_barras = ?, descricao = ?, quantidade_estoque = ?, categoria = ?, data_validade = ?, imagem = ?
         WHERE id = ?`,
        [
          nome.trim(),
          codigoTrimmed,
          descricao.trim(),
          qtd,
          categoria.trim(),
          data_validade ? data_validade.trim() : null,
          imagem,
          id,
        ]
      );

      const produtoAtualizado = await db.get('SELECT * FROM produtos WHERE id = ?', [id]);

      return res.status(200).json({
        mensagem: 'Produto atualizado com sucesso!',
        produto: produtoAtualizado,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao atualizar produto.' });
    }
  },

  async excluir(req, res) {
    try {
      const { id } = req.params;
      const produto = await db.get('SELECT id FROM produtos WHERE id = ?', [id]);
      if (!produto) {
        return res.status(404).json({ mensagem: 'Produto não encontrado.' });
      }

      await db.run('DELETE FROM produtos WHERE id = ?', [id]);

      return res.status(200).json({
        mensagem: 'Produto excluído com sucesso!',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao excluir produto.' });
    }
  },
};

module.exports = produtoController;
