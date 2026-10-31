const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  isValidCnpj,
  isValidEmail,
  isValidPhone,
  validateFornecedor,
  validateProduto,
} = require('../utils/validators');

const fornecedorValido = {
  nome_empresa: 'Fornecedor ABC',
  cnpj: '04.252.011/0001-10',
  endereco: 'Rua das Flores, 10',
  telefone: '(11) 3333-4444',
  email: 'contato@abc.com',
  contato_principal: 'Ana Silva',
};

const produtoValido = {
  nome: 'Caderno',
  codigo_barras: '1234567890123',
  descricao: 'Caderno universitário',
  quantidade_estoque: 0,
  categoria: 'Papelaria',
  data_validade: '2028-02-29',
};

test('CNPJ aceita formatos suportados com dígitos verificadores válidos', () => {
  assert.equal(isValidCnpj('04.252.011/0001-10'), true);
  assert.equal(isValidCnpj('04252011000110'), true);
  assert.equal(isValidCnpj('04.252.011/0001-11'), false);
  assert.equal(isValidCnpj('00.000.000/0000-00'), false);
});

test('e-mail e telefone rejeitam formatos inválidos', () => {
  assert.equal(isValidEmail('contato@abc.com'), true);
  assert.equal(isValidEmail('contato@abc'), false);
  assert.equal(isValidPhone('(11) 3333-4444'), true);
  assert.equal(isValidPhone('(1) 23'), false);
});

test('fornecedor exige todos os campos e reporta cada campo ausente', () => {
  const { valido, erros } = validateFornecedor({});

  assert.equal(valido, false);
  for (const campo of Object.keys(fornecedorValido)) {
    assert.ok(erros[campo], `esperava erro para ${campo}`);
  }
});

test('fornecedor válido passa e formatos inválidos são rejeitados por campo', () => {
  assert.equal(validateFornecedor(fornecedorValido).valido, true);
  assert.ok(validateFornecedor({ ...fornecedorValido, cnpj: '04.252.011/0001-11' }).erros.cnpj);
  assert.ok(validateFornecedor({ ...fornecedorValido, email: 'email-invalido' }).erros.email);
  assert.ok(validateFornecedor({ ...fornecedorValido, telefone: '123' }).erros.telefone);
});

test('produto exige nome, descrição e categoria', () => {
  const { valido, erros } = validateProduto({});

  assert.equal(valido, false);
  for (const campo of ['nome', 'descricao', 'categoria']) {
    assert.ok(erros[campo], `esperava erro para ${campo}`);
  }
});

test('estoque aceita zero e inteiros não negativos, mas rejeita inválidos', () => {
  assert.equal(validateProduto(produtoValido).valido, true);
  for (const quantidade of [-1, 1.5, 'abc']) {
    assert.ok(validateProduto({ ...produtoValido, quantidade_estoque: quantidade }).erros.quantidade_estoque);
  }
});

test('validade aceita data real e rejeita formato ou dia inexistente', () => {
  assert.equal(validateProduto(produtoValido).valido, true);
  assert.ok(validateProduto({ ...produtoValido, data_validade: '2028-02-30' }).erros.data_validade);
  assert.ok(validateProduto({ ...produtoValido, data_validade: '31/02/2028' }).erros.data_validade);
});

test('código de barras opcional aceita apenas dígitos quando informado', () => {
  assert.equal(validateProduto({ ...produtoValido, codigo_barras: '' }).valido, true);
  assert.ok(validateProduto({ ...produtoValido, codigo_barras: '123abc' }).erros.codigo_barras);
});