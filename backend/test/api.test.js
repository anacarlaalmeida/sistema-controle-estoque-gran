const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

process.env.NODE_ENV = 'test';

const app = require('../app');
const { initDb, closeDb, getDb, run } = require('../database/db');

let server;
let baseUrl;

before(async () => {
  await initDb();
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closeDb();
});

test('GET / deve responder Olá, Mundo!', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.equal(text, 'Olá, Mundo!');
});

// ==========================================
// Testes do Controlador de Fornecedores
// ==========================================
test('Fornecedor - Cenário 1 (Sucesso): Cadastrar fornecedor válido', async () => {
  const dados = {
    nome_empresa: 'Distribuidora Alfa Ltda',
    cnpj: '11.222.333/0001-81',
    endereco: 'Av. Paulista, 1000 - Bela Vista, SP',
    telefone: '(11) 3333-4444',
    email: 'contato@distribuidoraalfa.com',
    contato_principal: 'Carlos Pereira',
  };

  const res = await fetch(`${baseUrl}/fornecedores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  const json = await res.json();
  assert.equal(res.status, 201);
  assert.equal(json.mensagem, 'Fornecedor cadastrado com sucesso!');
  assert.ok(json.fornecedor.id);
  assert.equal(json.fornecedor.nome_empresa, dados.nome_empresa);
});

test('Fornecedor - Cenário 2 (CNPJ Duplicado): Bloquear cadastro duplicado', async () => {
  const dados = {
    nome_empresa: 'Outra Empresa Ltda',
    cnpj: '11222333000181', // mesmo CNPJ sem máscara
    endereco: 'Rua Central, 50',
    telefone: '(11) 2222-3333',
    email: 'outro@empresa.com',
    contato_principal: 'Mariana Lima',
  };

  const res = await fetch(`${baseUrl}/fornecedores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  const json = await res.json();
  assert.equal(res.status, 400);
  assert.equal(json.mensagem, 'Fornecedor com esse CNPJ já está cadastrado!');
});

test('Fornecedor - Cenário 3 (Dados Inválidos): Validar campos em branco ou incorretos', async () => {
  const dadosInvalidos = {
    nome_empresa: '',
    cnpj: '12345',
    endereco: '',
    telefone: '',
    email: 'invalido',
    contato_principal: '',
  };

  const res = await fetch(`${baseUrl}/fornecedores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosInvalidos),
  });

  const json = await res.json();
  assert.equal(res.status, 400);
  assert.equal(json.mensagem, 'Dados inválidos.');
  assert.ok(json.erros.nome_empresa);
  assert.ok(json.erros.cnpj);
  assert.ok(json.erros.endereco);
  assert.ok(json.erros.telefone);
  assert.ok(json.erros.email);
  assert.ok(json.erros.contato_principal);
});

test('Fornecedor - CRUD: Listar, Buscar por ID, Atualizar e Excluir', async () => {
  // Cadastrar segundo fornecedor
  const cad = await fetch(`${baseUrl}/fornecedores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome_empresa: 'Beta Suprimentos',
      cnpj: '72.338.463/0001-79',
      endereco: 'Rua do Comércio, 200',
      telefone: '(21) 98765-4321',
      email: 'contato@betasuprimentos.com',
      contato_principal: 'Fernanda Rocha',
    }),
  });
  const { fornecedor } = await cad.json();

  // Listar
  const listRes = await fetch(`${baseUrl}/fornecedores`);
  const lista = await listRes.json();
  assert.equal(listRes.status, 200);
  assert.ok(Array.isArray(lista));
  assert.ok(lista.length >= 2);

  // Buscar por ID
  const getRes = await fetch(`${baseUrl}/fornecedores/${fornecedor.id}`);
  const getForn = await getRes.json();
  assert.equal(getRes.status, 200);
  assert.equal(getForn.nome_empresa, 'Beta Suprimentos');

  // Atualizar
  const updRes = await fetch(`${baseUrl}/fornecedores/${fornecedor.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome_empresa: 'Beta Suprimentos Atualizada',
      cnpj: '72.338.463/0001-79',
      endereco: 'Nova Rua, 300',
      telefone: '(21) 98765-4321',
      email: 'contato@betasuprimentos.com',
      contato_principal: 'Fernanda Rocha Silva',
    }),
  });
  const updJson = await updRes.json();
  assert.equal(updRes.status, 200);
  assert.equal(updJson.mensagem, 'Fornecedor atualizado com sucesso!');
  assert.equal(updJson.fornecedor.nome_empresa, 'Beta Suprimentos Atualizada');

  // Excluir
  const delRes = await fetch(`${baseUrl}/fornecedores/${fornecedor.id}`, {
    method: 'DELETE',
  });
  const delJson = await delRes.json();
  assert.equal(delRes.status, 200);
  assert.equal(delJson.mensagem, 'Fornecedor excluído com sucesso!');
});

// ==========================================
// Testes do Controlador de Produtos
// ==========================================
test('Produto - Cenário 1 (Sucesso): Cadastrar produto válido', async () => {
  const dados = {
    nome: 'Mouse Gamer RGB',
    codigo_barras: '7890001112223',
    descricao: 'Mouse gamer óptico 16000 DPI com iluminação RGB configurável',
    quantidade_estoque: 50,
    categoria: 'Eletrônicos',
    data_validade: null,
  };

  const res = await fetch(`${baseUrl}/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  const json = await res.json();
  assert.equal(res.status, 201);
  assert.equal(json.mensagem, 'Produto cadastrado com sucesso!');
  assert.ok(json.produto.id);
  assert.equal(json.produto.nome, dados.nome);
});

test('Produto - Cenário 2 (Código de Barras Duplicado): Bloquear cadastro duplicado', async () => {
  const dados = {
    nome: 'Outro Mouse',
    codigo_barras: '7890001112223', // mesmo código de barras
    descricao: 'Outra descrição de produto',
    quantidade_estoque: 10,
    categoria: 'Eletrônicos',
  };

  const res = await fetch(`${baseUrl}/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  const json = await res.json();
  assert.equal(res.status, 400);
  assert.equal(json.mensagem, 'Produto com este código de barras já está cadastrado!');
});

test('Produto - Cenário 3 (Dados Inválidos): Validar campos em branco ou inválidos', async () => {
  const dadosInvalidos = {
    nome: '',
    descricao: '',
    categoria: '',
    quantidade_estoque: -10,
    data_validade: 'data-invalida',
  };

  const res = await fetch(`${baseUrl}/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosInvalidos),
  });

  const json = await res.json();
  assert.equal(res.status, 400);
  assert.equal(json.mensagem, 'Dados inválidos.');
  assert.ok(json.erros.nome);
  assert.ok(json.erros.descricao);
  assert.ok(json.erros.categoria);
  assert.ok(json.erros.quantidade_estoque);
  assert.ok(json.erros.data_validade);
});

test('Produto - CRUD: Listar, Buscar por ID, Atualizar e Excluir', async () => {
  // Cadastrar produto para atualizar e excluir
  const cad = await fetch(`${baseUrl}/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: 'Headset Sem Fio',
      codigo_barras: '7899998887776',
      descricao: 'Headset bluetooth 7.1',
      quantidade_estoque: 15,
      categoria: 'Eletrônicos',
    }),
  });
  const { produto } = await cad.json();

  // Listar
  const listRes = await fetch(`${baseUrl}/produtos`);
  const lista = await listRes.json();
  assert.equal(listRes.status, 200);
  assert.ok(Array.isArray(lista));
  assert.ok(lista.length >= 2);

  // Buscar por ID
  const getRes = await fetch(`${baseUrl}/produtos/${produto.id}`);
  const getProd = await getRes.json();
  assert.equal(getRes.status, 200);
  assert.equal(getProd.nome, 'Headset Sem Fio');

  // Atualizar
  const updRes = await fetch(`${baseUrl}/produtos/${produto.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: 'Headset Sem Fio Pro',
      codigo_barras: '7899998887776',
      descricao: 'Headset bluetooth 7.1 cancelamento de ruído',
      quantidade_estoque: 20,
      categoria: 'Eletrônicos',
    }),
  });
  const updJson = await updRes.json();
  assert.equal(updRes.status, 200);
  assert.equal(updJson.mensagem, 'Produto atualizado com sucesso!');
  assert.equal(updJson.produto.nome, 'Headset Sem Fio Pro');

  // Excluir
  const delRes = await fetch(`${baseUrl}/produtos/${produto.id}`, {
    method: 'DELETE',
  });
  const delJson = await delRes.json();
  assert.equal(delRes.status, 200);
  assert.equal(delJson.mensagem, 'Produto excluído com sucesso!');
});

// ==========================================
// Testes do Controlador de Associação
// ==========================================
test('Associação - Cenário 1 (Sucesso): Associar fornecedor a produto', async () => {
  // Pegamos o fornecedor 1 e o produto 1 cadastrados nos primeiros testes
  const fornRes = await fetch(`${baseUrl}/fornecedores`);
  const [fornecedor] = await fornRes.json();

  const prodRes = await fetch(`${baseUrl}/produtos`);
  const [produto] = await prodRes.json();

  const res = await fetch(`${baseUrl}/produtos/${produto.id}/fornecedores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fornecedor_id: fornecedor.id }),
  });

  const json = await res.json();
  assert.equal(res.status, 201);
  assert.equal(json.mensagem, 'Fornecedor associado com sucesso ao produto!');
});

test('Associação - Cenário 2 (Duplicada): Bloquear associação já existente', async () => {
  const fornRes = await fetch(`${baseUrl}/fornecedores`);
  const [fornecedor] = await fornRes.json();

  const prodRes = await fetch(`${baseUrl}/produtos`);
  const [produto] = await prodRes.json();

  const res = await fetch(`${baseUrl}/produtos/${produto.id}/fornecedores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fornecedor_id: fornecedor.id }),
  });

  const json = await res.json();
  assert.equal(res.status, 400);
  assert.equal(json.mensagem, 'Fornecedor já está associado a este produto!');
});

test('Associação - Listar fornecedores do produto e produtos do fornecedor', async () => {
  const fornRes = await fetch(`${baseUrl}/fornecedores`);
  const [fornecedor] = await fornRes.json();

  const prodRes = await fetch(`${baseUrl}/produtos`);
  const [produto] = await prodRes.json();

  // Fornecedores do produto
  const fRes = await fetch(`${baseUrl}/produtos/${produto.id}/fornecedores`);
  const fList = await fRes.json();
  assert.equal(fRes.status, 200);
  assert.ok(fList.some((f) => f.id === fornecedor.id));

  // Produtos do fornecedor
  const pRes = await fetch(`${baseUrl}/fornecedores/${fornecedor.id}/produtos`);
  const pList = await pRes.json();
  assert.equal(pRes.status, 200);
  assert.ok(pList.some((p) => p.id === produto.id));
});

test('Associação - Cenário 3 (Desassociar): Remover vínculo entre fornecedor e produto', async () => {
  const fornRes = await fetch(`${baseUrl}/fornecedores`);
  const [fornecedor] = await fornRes.json();

  const prodRes = await fetch(`${baseUrl}/produtos`);
  const [produto] = await prodRes.json();

  const res = await fetch(`${baseUrl}/produtos/${produto.id}/fornecedores/${fornecedor.id}`, {
    method: 'DELETE',
  });

  const json = await res.json();
  assert.equal(res.status, 200);
  assert.equal(json.mensagem, 'Fornecedor desassociado com sucesso!');

  // Validar que não está mais associado
  const fRes = await fetch(`${baseUrl}/produtos/${produto.id}/fornecedores`);
  const fList = await fRes.json();
  assert.equal(fList.length, 0);
});
