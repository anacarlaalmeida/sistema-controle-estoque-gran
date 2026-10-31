function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function isValidCnpj(cnpj) {
  if (!cnpj || typeof cnpj !== 'string') return false;
  const trimmed = cnpj.trim();
  // Aceita formato com máscara '00.000.000/0000-00' ou 14 dígitos numéricos
  const cnpjRegex = /^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/;
  return cnpjRegex.test(trimmed);
}

function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

function validateFornecedor(data) {
  const erros = {};

  if (!data.nome_empresa || !data.nome_empresa.trim()) {
    erros.nome_empresa = 'O nome da empresa é obrigatório.';
  }

  if (!data.cnpj || !data.cnpj.trim()) {
    erros.cnpj = 'O CNPJ é obrigatório.';
  } else if (!isValidCnpj(data.cnpj)) {
    erros.cnpj = 'O CNPJ informado é inválido.';
  }

  if (!data.endereco || !data.endereco.trim()) {
    erros.endereco = 'O endereço completo é obrigatório.';
  }

  if (!data.telefone || !data.telefone.trim()) {
    erros.telefone = 'O telefone é obrigatório.';
  } else if (!isValidPhone(data.telefone)) {
    erros.telefone = 'O telefone informado é inválido.';
  }

  if (!data.email || !data.email.trim()) {
    erros.email = 'O e-mail é obrigatório.';
  } else if (!isValidEmail(data.email)) {
    erros.email = 'O e-mail informado é inválido.';
  }

  if (!data.contato_principal || !data.contato_principal.trim()) {
    erros.contato_principal = 'O contato principal é obrigatório.';
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros,
  };
}

function validateProduto(data) {
  const erros = {};

  if (!data.nome || !data.nome.trim()) {
    erros.nome = 'O nome do produto é obrigatório.';
  }

  if (!data.descricao || !data.descricao.trim()) {
    erros.descricao = 'A descrição do produto é obrigatória.';
  }

  if (!data.categoria || !data.categoria.trim()) {
    erros.categoria = 'A categoria do produto é obrigatória.';
  }

  if (data.quantidade_estoque !== undefined && data.quantidade_estoque !== null && data.quantidade_estoque !== '') {
    const qtd = Number(data.quantidade_estoque);
    if (isNaN(qtd) || qtd < 0 || !Number.isInteger(qtd)) {
      erros.quantidade_estoque = 'A quantidade em estoque deve ser um número inteiro maior ou igual a zero.';
    }
  }

  if (data.data_validade) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.data_validade) && isNaN(Date.parse(data.data_validade))) {
      erros.data_validade = 'A data de validade é inválida.';
    }
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros,
  };
}

module.exports = {
  isValidEmail,
  isValidCnpj,
  isValidPhone,
  validateFornecedor,
  validateProduto,
};
