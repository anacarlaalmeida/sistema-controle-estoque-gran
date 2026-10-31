import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export default function AssociacaoPage({ produtoIdInicial, onVoltar }) {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState(
    produtoIdInicial ? String(produtoIdInicial) : ''
  );
  const [produtoDetalhes, setProdutoDetalhes] = useState(null);
  const [fornecedoresAssociados, setFornecedoresAssociados] = useState([]);
  const [fornecedorParaAssociarId, setFornecedorParaAssociarId] = useState('');
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [carregando, setCarregando] = useState(false);

  const carregarListasIniciais = useCallback(async () => {
    const [resProdutos, resFornecedores] = await Promise.all([
      api.listarProdutos(),
      api.listarFornecedores(),
    ]);

    if (resProdutos.ok && Array.isArray(resProdutos.data)) {
      setProdutos(resProdutos.data);
      if (!produtoIdInicial && resProdutos.data.length > 0 && !produtoSelecionadoId) {
        setProdutoSelecionadoId(String(resProdutos.data[0].id));
      }
    }

    if (resFornecedores.ok && Array.isArray(resFornecedores.data)) {
      setFornecedores(resFornecedores.data);
    }
  }, [produtoIdInicial, produtoSelecionadoId]);

  const carregarDetalhesDoProduto = useCallback(async (id) => {
    if (!id) {
      setProdutoDetalhes(null);
      setFornecedoresAssociados([]);
      return;
    }

    const [resProd, resAssoc] = await Promise.all([
      api.buscarProduto(id),
      api.listarFornecedoresDoProduto(id),
    ]);

    if (resProd.ok) {
      setProdutoDetalhes(resProd.data);
    }
    if (resAssoc.ok && Array.isArray(resAssoc.data)) {
      setFornecedoresAssociados(resAssoc.data);
    }
  }, []);

  useEffect(() => {
    carregarListasIniciais();
  }, [carregarListasIniciais]);

  useEffect(() => {
    if (produtoIdInicial) {
      setProdutoSelecionadoId(String(produtoIdInicial));
    }
  }, [produtoIdInicial]);

  useEffect(() => {
    carregarDetalhesDoProduto(produtoSelecionadoId);
  }, [produtoSelecionadoId, carregarDetalhesDoProduto]);

  const handleAssociar = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });

    if (!produtoSelecionadoId) {
      setMensagem({ tipo: 'erro', texto: 'Selecione um produto primeiro.' });
      return;
    }

    if (!fornecedorParaAssociarId) {
      setMensagem({ tipo: 'erro', texto: 'Selecione um fornecedor para associar.' });
      return;
    }

    setCarregando(true);
    try {
      const res = await api.associarFornecedor(produtoSelecionadoId, fornecedorParaAssociarId);
      if (res.ok) {
        setMensagem({
          tipo: 'sucesso',
          texto: res.data?.mensagem || 'Fornecedor associado com sucesso ao produto!',
        });
        setFornecedorParaAssociarId('');
        await carregarDetalhesDoProduto(produtoSelecionadoId);
      } else {
        setMensagem({
          tipo: 'erro',
          texto: res.data?.mensagem || 'Fornecedor já está associado a este produto!',
        });
      }
    } catch {
      setMensagem({
        tipo: 'erro',
        texto: 'Erro de conexão com o servidor backend.',
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleDesassociar = async (fornecedorId) => {
    setMensagem({ tipo: '', texto: '' });
    try {
      const res = await api.desassociarFornecedor(produtoSelecionadoId, fornecedorId);
      if (res.ok) {
        setMensagem({
          tipo: 'sucesso',
          texto: res.data?.mensagem || 'Fornecedor desassociado com sucesso!',
        });
        await carregarDetalhesDoProduto(produtoSelecionadoId);
      } else {
        setMensagem({
          tipo: 'erro',
          texto: res.data?.mensagem || 'Erro ao desassociar fornecedor.',
        });
      }
    } catch {
      setMensagem({
        tipo: 'erro',
        texto: 'Erro de conexão com o servidor backend.',
      });
    }
  };

  return (
    <div className="page-container">
      {/* Cabeçalho exigido pelo protótipo */}
      <div className="page-header">
        <h2>Associação de Fornecedor a Produto</h2>
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

      {/* Seletor rápido de Produto caso queira alternar entre produtos cadastrados */}
      <div className="card">
        <div className="form-group">
          <label htmlFor="selecionar_produto">Produto em Exibição</label>
          <select
            id="selecionar_produto"
            value={produtoSelecionadoId}
            onChange={(e) => {
              setMensagem({ tipo: '', texto: '' });
              setProdutoSelecionadoId(e.target.value);
            }}
          >
            <option value="">Selecione um produto</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} {p.codigo_barras ? `(Cód: ${p.codigo_barras})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Seção Detalhes do Produto (Somente Leitura) */}
      <div className="card">
        <h3>Detalhes do Produto</h3>
        <div className="product-details-layout">
          <div className="form-grid flex-1">
            <div className="form-group">
              <label htmlFor="detalhe_nome">Nome do Produto</label>
              <input
                id="detalhe_nome"
                type="text"
                readOnly
                value={produtoDetalhes?.nome || ''}
                placeholder="Nome do produto"
                className="input-readonly"
              />
            </div>

            <div className="form-group">
              <label htmlFor="detalhe_codigo_barras">Código de Barras</label>
              <input
                id="detalhe_codigo_barras"
                type="text"
                readOnly
                value={produtoDetalhes?.codigo_barras || ''}
                placeholder="Código de barras"
                className="input-readonly"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="detalhe_descricao">Descrição</label>
              <textarea
                id="detalhe_descricao"
                rows={2}
                readOnly
                value={produtoDetalhes?.descricao || ''}
                placeholder="Descrição breve do produto"
                className="input-readonly"
              />
            </div>
          </div>

          <div className="product-image-box">
            <span className="image-label">Imagem do Produto</span>
            {produtoDetalhes?.imagem ? (
              <img
                src={
                  produtoDetalhes.imagem.startsWith('http')
                    ? produtoDetalhes.imagem
                    : `${api.baseUrl}${produtoDetalhes.imagem}`
                }
                alt={produtoDetalhes.nome}
                className="product-thumb-large"
              />
            ) : (
              <div className="product-thumb-placeholder">Sem imagem</div>
            )}
          </div>
        </div>
      </div>

      {/* Seção Associação de Fornecedor */}
      <form className="card" onSubmit={handleAssociar}>
        <h3>Associação de Fornecedor</h3>
        <div className="association-row">
          <div className="form-group flex-1">
            <label htmlFor="selecao_fornecedor">Seleção de Fornecedor</label>
            <select
              id="selecao_fornecedor"
              value={fornecedorParaAssociarId}
              onChange={(e) => setFornecedorParaAssociarId(e.target.value)}
            >
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome_empresa} — CNPJ: {f.cnpj}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={carregando}>
            Associar Fornecedor
          </button>
        </div>
      </form>

      {/* Seção Fornecedores Associados */}
      <div className="card list-section">
        <h3>Fornecedores Associados</h3>
        {fornecedoresAssociados.length === 0 ? (
          <p className="empty-text">Nenhum fornecedor associado a este produto no momento.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome do Fornecedor</th>
                  <th>CNPJ</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {fornecedoresAssociados.map((f) => (
                  <tr key={f.id}>
                    <td>{f.nome_empresa}</td>
                    <td>{f.cnpj}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-small btn-danger"
                        onClick={() => handleDesassociar(f.id)}
                      >
                        Desassociar
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

