import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function formatCnpj(value) {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

function formatTelefone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

const initialForm = {
  nome_empresa: '',
  cnpj: '',
  endereco: '',
  telefone: '',
  email: '',
  contato_principal: '',
};

export default function FornecedorPage({ onVoltar }) {
  const [form, setForm] = useState(initialForm);
  const [editandoId, setEditandoId] = useState(null);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const carregarFornecedores = async () => {
    const res = await api.listarFornecedores();
    if (res.ok && Array.isArray(res.data)) {
      setFornecedores(res.data);
    }
  };

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'cnpj') {
      formattedValue = formatCnpj(value);
    } else if (name === 'telefone') {
      formattedValue = formatTelefone(value);
    }
    setForm((prev) => ({ ...prev, [name]: formattedValue }));
    if (erros[name]) {
      setErros((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErros({});
    setMensagem({ tipo: '', texto: '' });
    setCarregando(true);

    try {
      const res = editandoId
        ? await api.atualizarFornecedor(editandoId, form)
        : await api.criarFornecedor(form);

      if (res.ok) {
        setMensagem({
          tipo: 'sucesso',
          texto: res.data.mensagem || 'Fornecedor cadastrado com sucesso!',
        });
        setForm(initialForm);
        setEditandoId(null);
        await carregarFornecedores();
      } else {
        if (res.data?.erros) {
          setErros(res.data.erros);
        }
        setMensagem({
          tipo: 'erro',
          texto: res.data?.mensagem || 'Não foi possível salvar o fornecedor.',
        });
      }
    } catch {
      setMensagem({
        tipo: 'erro',
        texto: 'Erro de conexão com o servidor backend (verifique se está rodando na porta 3000).',
      });
    } finally {
      setCarregando(false);
    }
  };

  const iniciarEdicao = (fornecedor) => {
    setEditandoId(fornecedor.id);
    setForm({
      nome_empresa: fornecedor.nome_empresa || '',
      cnpj: fornecedor.cnpj || '',
      endereco: fornecedor.endereco || '',
      telefone: fornecedor.telefone || '',
      email: fornecedor.email || '',
      contato_principal: fornecedor.contato_principal || '',
    });
    setErros({});
    setMensagem({ tipo: '', texto: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setForm(initialForm);
    setErros({});
    setMensagem({ tipo: '', texto: '' });
  };

  const handleExcluir = async (id) => {
    const res = await api.excluirFornecedor(id);
    if (res.ok) {
      setMensagem({
        tipo: 'sucesso',
        texto: res.data?.mensagem || 'Fornecedor excluído com sucesso!',
      });
      if (editandoId === id) {
        cancelarEdicao();
      }
      await carregarFornecedores();
    } else {
      setMensagem({
        tipo: 'erro',
        texto: res.data?.mensagem || 'Erro ao excluir fornecedor.',
      });
    }
  };

  return (
    <div className="page-container">
      {/* Cabeçalho exigido pelo protótipo */}
      <div className="page-header">
        <h2>Cadastro de Fornecedor</h2>
        <button type="button" className="btn-secondary" onClick={onVoltar}>
          Voltar / Fechar
        </button>
      </div>

      {mensagem.texto && (
        <div
          role="alert"
          className={`alert ${mensagem.tipo === 'sucesso' ? 'alert-success' : 'alert-error'}`}
        >
          {mensagem.texto}
        </div>
      )}

      <form className="card form-grid" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="nome_empresa">Nome da Empresa *</label>
          <div className="field-row">
            <input
              id="nome_empresa"
              name="nome_empresa"
              type="text"
              placeholder="Insira o nome da empresa"
              value={form.nome_empresa}
              onChange={handleChange}
              className={erros.nome_empresa ? 'input-error' : ''}
            />
            {erros.nome_empresa && <span className="field-error">{erros.nome_empresa}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="cnpj">CNPJ *</label>
          <div className="field-row">
            <input
              id="cnpj"
              name="cnpj"
              type="text"
              placeholder="00.000.000/0000-00"
              value={form.cnpj}
              onChange={handleChange}
              className={erros.cnpj ? 'input-error' : ''}
            />
            {erros.cnpj && <span className="field-error">{erros.cnpj}</span>}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="endereco">Endereço *</label>
          <div className="field-row">
            <textarea
              id="endereco"
              name="endereco"
              rows={2}
              placeholder="Insira o endereço completo da empresa"
              value={form.endereco}
              onChange={handleChange}
              className={erros.endereco ? 'input-error' : ''}
            />
            {erros.endereco && <span className="field-error">{erros.endereco}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="telefone">Telefone *</label>
          <div className="field-row">
            <input
              id="telefone"
              name="telefone"
              type="text"
              placeholder="(00) 0000-0000"
              value={form.telefone}
              onChange={handleChange}
              className={erros.telefone ? 'input-error' : ''}
            />
            {erros.telefone && <span className="field-error">{erros.telefone}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail *</label>
          <div className="field-row">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="exemplo@fornecedor.com"
              value={form.email}
              onChange={handleChange}
              className={erros.email ? 'input-error' : ''}
            />
            {erros.email && <span className="field-error">{erros.email}</span>}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="contato_principal">Contato Principal *</label>
          <div className="field-row">
            <input
              id="contato_principal"
              name="contato_principal"
              type="text"
              placeholder="Nome do contato principal"
              value={form.contato_principal}
              onChange={handleChange}
              className={erros.contato_principal ? 'input-error' : ''}
            />
            {erros.contato_principal && (
              <span className="field-error">{erros.contato_principal}</span>
            )}
          </div>
        </div>

        <div className="form-actions full-width">
          <button type="submit" className="btn-primary" disabled={carregando}>
            {editandoId ? 'Salvar Alterações' : 'Cadastrar'}
          </button>
          {editandoId && (
            <button type="button" className="btn-secondary" onClick={cancelarEdicao}>
              Cancelar Edição
            </button>
          )}
        </div>
      </form>

      <div className="card list-section">
        <h3>Fornecedores Cadastrados ({fornecedores.length})</h3>
        {fornecedores.length === 0 ? (
          <p className="empty-text">Nenhum fornecedor cadastrado ainda.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>CNPJ</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Contato Principal</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {fornecedores.map((f) => (
                  <tr key={f.id}>
                    <td>{f.nome_empresa}</td>
                    <td>{f.cnpj}</td>
                    <td>{f.telefone}</td>
                    <td>{f.email}</td>
                    <td>{f.contato_principal}</td>
                    <td className="actions-cell">
                      <button
                        type="button"
                        className="btn-small btn-secondary"
                        onClick={() => iniciarEdicao(f)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn-small btn-danger"
                        onClick={() => handleExcluir(f.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

