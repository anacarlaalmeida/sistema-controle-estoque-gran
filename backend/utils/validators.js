function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function isValidCnpj(cnpj) {
  if (!cnpj || typeof cnpj !== 'string') return false;
  const trimmed = cnpj.trim();
  const cnpjRegex = /^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/;
  if (!cnpjRegex.test(trimmed)) return false;

  const digits = trimmed.replace(/\D/g, '');
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calculateDigit = (values, weights) => {
    const sum = weights.reduce((total, weight, index) => total + Number(values[index]) * weight, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calculateDigit(
    `${digits.slice(0, 12)}${firstDigit}`,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  );

  return digits.endsWith(`${firstDigit}${secondDigit}`);
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

  if (data.codigo_barras !== undefined && data.codigo_barras !== null && String(data.codigo_barras).trim()) {
    if (!/^\d+$/.test(String(data.codigo_barras).trim())) {
      erros.codigo_barras = 'O código de barras deve conter apenas números.';
    }
  }

  if (data.quantidade_estoque !== undefined && data.quantidade_estoque !== null && data.quantidade_estoque !== '') {
    const qtd = Number(data.quantidade_estoque);
    if (isNaN(qtd) || qtd < 0 || !Number.isInteger(qtd)) {
      erros.quantidade_estoque = 'A quantidade em estoque deve ser um número inteiro maior ou igual a zero.';
    }
  }

  if (data.data_validade) {
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data.data_validade);
    if (!dateMatch) {
      erros.data_validade = 'A data de validade é inválida.';
    } else {
      const [, yearText, monthText, dayText] = dateMatch;
      const year = Number(yearText);
      const month = Number(monthText);
      const day = Number(dayText);
      const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
        erros.data_validade = 'A data de validade é inválida.';
      }
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
