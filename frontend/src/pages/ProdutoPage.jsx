import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const CATEGORIAS_PADRAO = ['Eletrônicos', 'Alimentos', 'Vestuário'];

const initialForm = {
  nome: '',
  codigo_barras: '',
  descricao: '',
  quantidade_estoque: '',
  categoriaSelecionada: '',
  outraCategoria: '',
  data_validade: '',
};

export default function ProdutoPage({ onVoltar, onIrParaAssociacao }) {
  const [form, setForm] = useState(initialForm);
  const [imagemFile, setImagemFile] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const fileInputRef = useRef(null);

  const carregarProdutos = async () => {
    const res = await api.listarProdutos();
    if (res.ok && Array.isArray(res.data)) {
      setProdutos(res.data);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'codigo_barras') {
      newValue = value.replace(/\D/g, '');
    }
    setForm((prev) => ({ ...prev, [name]: newValue }));
    const errorKey = name === 'categoriaSelecionada' || name === 'outraCategoria' ? 'categoria' : name;
    if (erros[errorKey]) {
      setErros((prev) => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImagemFile(file);
  };

  const limparFormulario = () => {
    setForm(initialForm);
    setImagemFile(null);
    setEditandoId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErros({});
    setMensagem({ tipo: '', texto: '' });
    setCarregando(true);

    const categoriaFinal =
      form.categoriaSelecionada === 'Outro'
        ? form.outraCategoria.trim()
        : form.categoriaSelecionada;

    const formData = new FormData();
    formData.append('nome', form.nome);
    formData.append('codigo_barras', form.codigo_barras);
    formData.append('descricao', form.descricao);
    if (form.quantidade_estoque !== '') {
      formData.append('quantidade_estoque', form.quantidade_estoque);
    }
    formData.append('categoria', categoriaFinal);
    if (form.data_validade) {
      formData.append('data_validade', form.data_validade);
    }
    if (imagemFile) {
      formData.append('imagem', imagemFile);
    }

    try {
      const res = editandoId
        ? await api.atualizarProduto(editandoId, formData)
        : await api.criarProduto(formData);

      if (res.ok) {
        setMensagem({
          tipo: 'sucesso',
          texto: res.data.mensagem || 'Produto cadastrado com sucesso!',
        });
        limparFormulario();
        await carregarProdutos();
      } else {
        if (res.data?.erros) {
          setErros(res.data.erros);
        }
        setMensagem({
          tipo: 'erro',
          texto: res.data?.mensagem || 'Não foi possível salvar o produto.',
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

  const iniciarEdicao = (produto) => {
    const isPadrao = CATEGORIAS_PADRAO.includes(produto.categoria);
    setEditandoId(produto.id);
    setForm({
      nome: produto.nome || '',
      codigo_barras: produto.codigo_barras || '',
      descricao: produto.descricao || '',
      quantidade_estoque:
        produto.quantidade_estoque !== null && produto.quantidade_estoque !== undefined
          ? String(produto.quantidade_estoque)
          : '',
      categoriaSelecionada: produto.categoria ? (isPadrao ? produto.categoria : 'Outro') : '',
      outraCategoria: produto.categoria && !isPadrao ? produto.categoria : '',
      data_validade: produto.data_validade || '',
    });
    setImagemFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErros({});
    setMensagem({ tipo: '', texto: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExcluir = async (id) => {
    const res = await api.excluirProduto(id);
    if (res.ok) {
      setMensagem({
        tipo: 'sucesso',
        texto: res.data?.mensagem || 'Produto excluído com sucesso!',
      });
      if (editandoId === id) {
        limparFormulario();
      }
      await carregarProdutos();
    } else {
      setMensagem({
        tipo: 'erro',
        texto: res.data?.mensagem || 'Erro ao excluir produto.',
      });
    }
  };

  return (
    <div className="page-container">
      {/* Cabeçalho exigido pelo protótipo */}
      <div className="page-header">
        <h2>Cadastro de Produto</h2>
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
          <label htmlFor="nome">Nome do Produto *</label>
          <div className="field-row">
            <input
              id="nome"
              name="nome"
              type="text"
              placeholder="Insira o nome do produto"
              value={form.nome}
              onChange={handleChange}
              className={erros.nome ? 'input-error' : ''}
            />
            {erros.nome && <span className="field-error">{erros.nome}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="codigo_barras">Código de Barras</label>
          <div className="field-row">
            <input
              id="codigo_barras"
              name="codigo_barras"
              type="text"
              inputMode="numeric"
              placeholder="Insira o código de barras"
              value={form.codigo_barras}
              onChange={handleChange}
              className={erros.codigo_barras ? 'input-error' : ''}
            />
            {erros.codigo_barras && <span className="field-error">{erros.codigo_barras}</span>}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="descricao">Descrição *</label>
          <div className="field-row">
            <textarea
              id="descricao"
              name="descricao"
              rows={3}
              placeholder="Descreva brevemente o produto"
              value={form.descricao}
              onChange={handleChange}
              className={erros.descricao ? 'input-error' : ''}
            />
            {erros.descricao && <span className="field-error">{erros.descricao}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="quantidade_estoque">Quantidade em Estoque</label>
          <div className="field-row">
            <input
              id="quantidade_estoque"
              name="quantidade_estoque"
              type="number"
              min="0"
              placeholder="Quantidade disponível"
              value={form.quantidade_estoque}
              onChange={handleChange}
              className={erros.quantidade_estoque ? 'input-error' : ''}
            />
            {erros.quantidade_estoque && (
              <span className="field-error">{erros.quantidade_estoque}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="categoriaSelecionada">Categoria *</label>
          <div className="field-row">
            <select
              id="categoriaSelecionada"
              name="categoriaSelecionada"
              value={form.categoriaSelecionada}
              onChange={handleChange}
              className={erros.categoria ? 'input-error' : ''}
            >
              <option value="">Selecione uma categoria</option>
              <option value="Eletrônicos">Eletrônicos</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Vestuário">Vestuário</option>
              <option value="Outro">Outro</option>
            </select>
            {erros.categoria && <span className="field-error">{erros.categoria}</span>}
          </div>
        </div>

        {form.categoriaSelecionada === 'Outro' && (
          <div className="form-group full-width">
            <label htmlFor="outraCategoria">Especifique a Categoria *</label>
            <div className="field-row">
              <input
                id="outraCategoria"
                name="outraCategoria"
                type="text"
                placeholder="Informe a categoria personalizada"
                value={form.outraCategoria}
                onChange={handleChange}
                className={erros.categoria ? 'input-error' : ''}
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="data_validade">Data de Validade (se aplicável)</label>
          <div className="field-row">
            <input
              id="data_validade"
              name="data_validade"
              type="date"
              placeholder="Selecione a data de validade"
              value={form.data_validade}
              onChange={handleChange}
              className={erros.data_validade ? 'input-error' : ''}
            />
            {erros.data_validade && <span className="field-error">{erros.data_validade}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="imagem">Imagem do Produto (se aplicável)</label>
          <div className="field-row">
            <input
              ref={fileInputRef}
              id="imagem"
              name="imagem"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="form-actions full-width">
          <button type="submit" className="btn-primary" disabled={carregando}>
            {editandoId ? 'Salvar Alterações' : 'Cadastrar'}
          </button>
          {editandoId && (
            <button type="button" className="btn-secondary" onClick={limparFormulario}>
              Cancelar Edição
            </button>
          )}
        </div>
      </form>

      <div className="card list-section">
        <h3>Produtos Cadastrados ({produtos.length})</h3>
        {produtos.length === 0 ? (
          <p className="empty-text">Nenhum produto cadastrado ainda.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Imagem</th>
                  <th>Nome</th>
                  <th>Código de Barras</th>
                  <th>Categoria</th>
                  <th>Estoque</th>
                  <th>Validade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.imagem ? (
                        <img
                          src={
                            p.imagem.startsWith('http')
                              ? p.imagem
                              : `${api.baseUrl}${p.imagem}`
                          }
                          alt={p.nome}
                          className="product-thumb-small"
                        />
                      ) : (
                        <span className="muted-badge">Sem imagem</span>
                      )}
                    </td>
                    <td>{p.nome}</td>
                    <td>{p.codigo_barras || '-'}</td>
                    <td>{p.categoria}</td>
                    <td>{p.quantidade_estoque ?? 0}</td>
                    <td>{p.data_validade || '-'}</td>
                    <td className="actions-cell">
                      <button
                        type="button"
                        className="btn-small btn-accent"
                        onClick={() => onIrParaAssociacao(p.id)}
                      >
                        Fornecedores
                      </button>
                      <button
                        type="button"
                        className="btn-small btn-secondary"
                        onClick={() => iniciarEdicao(p)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn-small btn-danger"
                        onClick={() => handleExcluir(p.id)}
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

