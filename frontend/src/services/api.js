const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

export const api = {
  baseUrl: API_BASE_URL,

  // Fornecedores
  listarFornecedores: () => request('/fornecedores'),
  buscarFornecedor: (id) => request(`/fornecedores/${id}`),
  criarFornecedor: (payload) =>
    request('/fornecedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  atualizarFornecedor: (id, payload) =>
    request(`/fornecedores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  excluirFornecedor: (id) =>
    request(`/fornecedores/${id}`, {
      method: 'DELETE',
    }),
  listarProdutosDoFornecedor: (fornecedorId) =>
    request(`/fornecedores/${fornecedorId}/produtos`),

  // Produtos
  listarProdutos: () => request('/produtos'),
  buscarProduto: (id) => request(`/produtos/${id}`),
  criarProduto: (formData) =>
    request('/produtos', {
      method: 'POST',
      body: formData,
    }),
  atualizarProduto: (id, formData) =>
    request(`/produtos/${id}`, {
      method: 'PUT',
      body: formData,
    }),
  excluirProduto: (id) =>
    request(`/produtos/${id}`, {
      method: 'DELETE',
    }),

  // Associação N:N Produto <-> Fornecedor
  listarFornecedoresDoProduto: (produtoId) =>
    request(`/produtos/${produtoId}/fornecedores`),
  associarFornecedor: (produtoId, fornecedorId) =>
    request(`/produtos/${produtoId}/fornecedores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fornecedor_id: Number(fornecedorId) }),
    }),
  desassociarFornecedor: (produtoId, fornecedorId) =>
    request(`/produtos/${produtoId}/fornecedores/${fornecedorId}`, {
      method: 'DELETE',
    }),
};

