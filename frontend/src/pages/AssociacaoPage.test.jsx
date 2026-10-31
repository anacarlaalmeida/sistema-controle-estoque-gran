import '../test/setup';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssociacaoPage from './AssociacaoPage';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    listarProdutos: vi.fn(),
    listarFornecedores: vi.fn(),
    buscarProduto: vi.fn(),
    listarFornecedoresDoProduto: vi.fn(),
    associarFornecedor: vi.fn(),
    desassociarFornecedor: vi.fn(),
  },
}));

const product = {
  id: 1,
  nome: 'Caderno',
  codigo_barras: '1234567890123',
  descricao: 'Caderno universitário',
  imagem: null,
};
const supplier = { id: 2, nome_empresa: 'Papelaria Central', cnpj: '04.252.011/0001-10' };

describe('Associação de fornecedor a produto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.listarProdutos.mockResolvedValue({ ok: true, data: [product] });
    api.listarFornecedores.mockResolvedValue({ ok: true, data: [supplier] });
    api.buscarProduto.mockResolvedValue({ ok: true, data: product });
    api.listarFornecedoresDoProduto.mockResolvedValue({ ok: true, data: [] });
  });

  it('exibe dados somente leitura, seleção e tabela de fornecedores associados', async () => {
    render(<AssociacaoPage produtoIdInicial={1} />);

    expect(await screen.findByDisplayValue('Caderno')).toHaveAttribute('readonly');
    expect(screen.getByDisplayValue('1234567890123')).toHaveAttribute('readonly');
    expect(screen.getByDisplayValue('Caderno universitário')).toHaveAttribute('readonly');
    expect(screen.getByRole('option', { name: /Papelaria Central/ })).toBeTruthy();
    expect(screen.getByText('Nenhum fornecedor associado a este produto no momento.')).toBeTruthy();
  });

  it('associa fornecedor, mostra confirmação e atualiza a lista', async () => {
    const user = userEvent.setup();
    api.associarFornecedor.mockResolvedValue({
      ok: true,
      data: { mensagem: 'Fornecedor associado com sucesso ao produto!' },
    });
    api.listarFornecedoresDoProduto
      .mockResolvedValueOnce({ ok: true, data: [] })
      .mockResolvedValueOnce({ ok: true, data: [supplier] });
    render(<AssociacaoPage produtoIdInicial={1} />);

    await user.selectOptions(await screen.findByLabelText('Seleção de Fornecedor'), '2');
    await user.click(screen.getByRole('button', { name: 'Associar Fornecedor' }));

    await waitFor(() => expect(api.associarFornecedor).toHaveBeenCalledWith('1', '2'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Fornecedor associado com sucesso ao produto!'
    );
    expect(await screen.findByText('Papelaria Central')).toBeTruthy();
    expect(screen.getByText('04.252.011/0001-10')).toBeTruthy();
  });

  it('exibe duplicidade e desassocia fornecedor associado', async () => {
    const user = userEvent.setup();
    api.listarFornecedoresDoProduto.mockResolvedValue({ ok: true, data: [supplier] });
    api.associarFornecedor.mockResolvedValue({
      ok: false,
      data: { mensagem: 'Fornecedor já está associado a este produto!' },
    });
    api.desassociarFornecedor.mockResolvedValue({
      ok: true,
      data: { mensagem: 'Fornecedor desassociado com sucesso!' },
    });
    render(<AssociacaoPage produtoIdInicial={1} />);

    await user.selectOptions(await screen.findByLabelText('Seleção de Fornecedor'), '2');
    await user.click(screen.getByRole('button', { name: 'Associar Fornecedor' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Fornecedor já está associado a este produto!'
    );

    await user.click(screen.getByRole('button', { name: 'Desassociar' }));
    await waitFor(() => expect(api.desassociarFornecedor).toHaveBeenCalledWith('1', 2));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Fornecedor desassociado com sucesso!'
    );
  });
});