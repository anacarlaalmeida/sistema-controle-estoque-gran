const db = require('../database/db');
const { validateFornecedor } = require('../utils/validators');

function normalizeCnpj(cnpj) {
  return cnpj.replace(/\D/g, '');
}

const fornecedorController = {
  async listar(req, res) {
    try {
      const fornecedores = await db.all('SELECT * FROM fornecedores ORDER BY id DESC');
      return res.status(200).json(fornecedores);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao listar fornecedores.' });
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const fornecedor = await db.get('SELECT * FROM fornecedores WHERE id = ?', [id]);
      if (!fornecedor) {
        return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
      }
      return res.status(200).json(fornecedor);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao buscar fornecedor.' });
    }
  },

  async criar(req, res) {
    try {
      const { nome_empresa, cnpj, endereco, telefone, email, contato_principal } = req.body;

      // Validação de dados de entrada
      const { valido, erros } = validateFornecedor({
        nome_empresa,
        cnpj,
        endereco,
        telefone,
        email,
        contato_principal,
      });

      if (!valido) {
        return res.status(400).json({
          mensagem: 'Dados inválidos.',
          erros,
        });
      }

      // Verificação de CNPJ duplicado
      const fornecedorExistente = await db.get(
        `SELECT id FROM fornecedores
         WHERE REPLACE(REPLACE(REPLACE(cnpj, '.', ''), '/', ''), '-', '') = ?`,
        [normalizeCnpj(cnpj)]
      );
      if (fornecedorExistente) {
        return res.status(400).json({
          mensagem: 'Fornecedor com esse CNPJ já está cadastrado!',
        });
      }

      // Inserção no banco de dados
      const resultado = await db.run(
        `INSERT INTO fornecedores (nome_empresa, cnpj, endereco, telefone, email, contato_principal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nome_empresa.trim(), cnpj.trim(), endereco.trim(), telefone.trim(), email.trim(), contato_principal.trim()]
      );

      const novoFornecedor = await db.get('SELECT * FROM fornecedores WHERE id = ?', [resultado.id]);

      return res.status(201).json({
        mensagem: 'Fornecedor cadastrado com sucesso!',
        fornecedor: novoFornecedor,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao cadastrar fornecedor.' });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome_empresa, cnpj, endereco, telefone, email, contato_principal } = req.body;

      const fornecedorAtual = await db.get('SELECT * FROM fornecedores WHERE id = ?', [id]);
      if (!fornecedorAtual) {
        return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
      }

      // Validação de dados de entrada
      const { valido, erros } = validateFornecedor({
        nome_empresa,
        cnpj,
        endereco,
        telefone,
        email,
        contato_principal,
      });

      if (!valido) {
        return res.status(400).json({
          mensagem: 'Dados inválidos.',
          erros,
        });
      }

      // Se alterou o CNPJ, verifica se outro fornecedor já possui
      if (normalizeCnpj(cnpj) !== normalizeCnpj(fornecedorAtual.cnpj)) {
        const duplicado = await db.get(
          `SELECT id FROM fornecedores
           WHERE REPLACE(REPLACE(REPLACE(cnpj, '.', ''), '/', ''), '-', '') = ? AND id != ?`,
          [normalizeCnpj(cnpj), id]
        );
        if (duplicado) {
          return res.status(400).json({
            mensagem: 'Fornecedor com esse CNPJ já está cadastrado!',
          });
        }
      }

      await db.run(
        `UPDATE fornecedores
         SET nome_empresa = ?, cnpj = ?, endereco = ?, telefone = ?, email = ?, contato_principal = ?
         WHERE id = ?`,
        [nome_empresa.trim(), cnpj.trim(), endereco.trim(), telefone.trim(), email.trim(), contato_principal.trim(), id]
      );

      const fornecedorAtualizado = await db.get('SELECT * FROM fornecedores WHERE id = ?', [id]);

      return res.status(200).json({
        mensagem: 'Fornecedor atualizado com sucesso!',
        fornecedor: fornecedorAtualizado,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao atualizar fornecedor.' });
    }
  },

  async excluir(req, res) {
    try {
      const { id } = req.params;
      const fornecedor = await db.get('SELECT id FROM fornecedores WHERE id = ?', [id]);
      if (!fornecedor) {
        return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
      }

      await db.run('DELETE FROM fornecedores WHERE id = ?', [id]);

      return res.status(200).json({
        mensagem: 'Fornecedor excluído com sucesso!',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao excluir fornecedor.' });
    }
  },
};

module.exports = fornecedorController;
