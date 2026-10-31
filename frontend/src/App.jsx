import React, { useState } from 'react';
import FornecedorPage from './pages/FornecedorPage';
import ProdutoPage from './pages/ProdutoPage';
import AssociacaoPage from './pages/AssociacaoPage';
import './App.css';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('fornecedores');
  const [produtoAssociacaoId, setProdutoAssociacaoId] = useState(null);

  const abrirAssociacaoDoProduto = (produtoId) => {
    setProdutoAssociacaoId(produtoId);
    setAbaAtiva('associacao');
  };

  return (
    <div className="app-shell">
      <header className="top-navbar">
        <div className="brand">
          <span className="brand-badge">GRAN</span>
          <div>
            <h1>Sistema de Controle de Estoque</h1>
            <p>Projeto Integrador Full Stack — Faculdade Gran</p>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="Navegação Principal">
          <button
            type="button"
            className={`nav-tab ${abaAtiva === 'fornecedores' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('fornecedores')}
          >
            Cadastro de Fornecedor
          </button>
          <button
            type="button"
            className={`nav-tab ${abaAtiva === 'produtos' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('produtos')}
          >
            Cadastro de Produto
          </button>
          <button
            type="button"
            className={`nav-tab ${abaAtiva === 'associacao' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('associacao')}
          >
            Associação Produto/Fornecedor
          </button>
        </nav>
      </header>

      <main className="main-content">
        {abaAtiva === 'fornecedores' && (
          <FornecedorPage onVoltar={() => setAbaAtiva('produtos')} />
        )}
        {abaAtiva === 'produtos' && (
          <ProdutoPage
            onVoltar={() => setAbaAtiva('fornecedores')}
            onIrParaAssociacao={abrirAssociacaoDoProduto}
          />
        )}
        {abaAtiva === 'associacao' && (
          <AssociacaoPage
            produtoIdInicial={produtoAssociacaoId}
            onVoltar={() => setAbaAtiva('produtos')}
          />
        )}
      </main>
    </div>
  );
}

