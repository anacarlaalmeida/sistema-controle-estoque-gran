import '../test/setup';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FornecedorPage from './FornecedorPage';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    listarFornecedores: vi.fn(),
    criarFornecedor: vi.fn(),
    atualizarFornecedor: vi.fn(),
    excluirFornecedor: vi.fn(),
  },
}));

describe('Cadastro de fornecedor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.listarFornecedores.mockResolvedValue({ ok: true, data: [] });
  });

  it('apresenta todos os campos obrigatórios e seus placeholders', () => {
    render(<FornecedorPage />);

    expect(screen.getByRole('heading', { name: 'Cadastro de Fornecedor' })).toBeTruthy();
    expect(screen.getByPlaceholderText('Insira o nome da empresa')).toBeTruthy();
    expect(screen.getByPlaceholderText('00.000.000/0000-00')).toBeTruthy();
    expect(screen.getByPlaceholderText('Insira o endereço completo da empresa')).toBeTruthy();
    expect(screen.getByPlaceholderText('(00) 0000-0000')).toBeTruthy();
    expect(screen.getByPlaceholderText('exemplo@fornecedor.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('Nome do contato principal')).toBeTruthy();
  });

  it('envia fornecedor válido e mostra confirmação', async () => {
    const user = userEvent.setup();
    api.criarFornecedor.mockResolvedValue({
      ok: true,
      data: { mensagem: 'Fornecedor cadastrado com sucesso!' },
    });
    render(<FornecedorPage />);

    await user.type(screen.getByLabelText('Nome da Empresa *'), 'Fornecedor ABC');
    await user.type(screen.getByLabelText('CNPJ *'), '04.252.011/0001-10');
    await user.type(screen.getByLabelText('Endereço *'), 'Rua das Flores, 10');
    await user.type(screen.getByLabelText('Telefone *'), '(11) 3333-4444');
    await user.type(screen.getByLabelText('E-mail *'), 'contato@abc.com');
    await user.type(screen.getByLabelText('Contato Principal *'), 'Ana Silva');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => expect(api.criarFornecedor).toHaveBeenCalledOnce());
    expect(screen.getByRole('alert').textContent).toBe('Fornecedor cadastrado com sucesso!');
  });

  it('mostra mensagem de CNPJ duplicado e erros junto aos campos inválidos', async () => {
    const user = userEvent.setup();
    api.criarFornecedor
      .mockResolvedValueOnce({
        ok: false,
        data: { mensagem: 'Fornecedor com esse CNPJ já está cadastrado!' },
      })
      .mockResolvedValueOnce({
        ok: false,
        data: {
          mensagem: 'Dados inválidos.',
          erros: {
            nome_empresa: 'Nome obrigatório.',
            cnpj: 'CNPJ inválido.',
            endereco: 'Endereço obrigatório.',
            telefone: 'Telefone inválido.',
            email: 'E-mail inválido.',
            contato_principal: 'Contato obrigatório.',
          },
        },
      });
    render(<FornecedorPage />);

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Fornecedor com esse CNPJ já está cadastrado!'
    );

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));
    expect(await screen.findByText('Nome obrigatório.')).toBeTruthy();
    expect(screen.getByText('CNPJ inválido.')).toBeTruthy();
    expect(screen.getByText('Endereço obrigatório.')).toBeTruthy();
    expect(screen.getByText('Telefone inválido.')).toBeTruthy();
    expect(screen.getByText('E-mail inválido.')).toBeTruthy();
    expect(screen.getByText('Contato obrigatório.')).toBeTruthy();
  });
});