import '../test/setup';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProdutoPage from './ProdutoPage';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    listarProdutos: vi.fn(),
    criarProduto: vi.fn(),
    atualizarProduto: vi.fn(),
    excluirProduto: vi.fn(),
  },
}));

describe('Cadastro de produto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.listarProdutos.mockResolvedValue({ ok: true, data: [] });
  });

  it('apresenta os campos, categorias e controles opcionais especificados', () => {
    render(<ProdutoPage />);

    expect(screen.getByRole('heading', { name: 'Cadastro de Produto' })).toBeTruthy();
    expect(screen.getByPlaceholderText('Insira o nome do produto')).toBeTruthy();
    expect(screen.getByPlaceholderText('Insira o código de barras')).toBeTruthy();
    expect(screen.getByPlaceholderText('Descreva brevemente o produto')).toBeTruthy();
    expect(screen.getByPlaceholderText('Quantidade disponível')).toBeTruthy();
    expect(screen.getByLabelText('Categoria *')).toBeTruthy();
    expect(screen.getByLabelText('Data de Validade (se aplicável)')).toBeTruthy();
    expect(screen.getByLabelText('Imagem do Produto (se aplicável)')).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Eletrônicos' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Alimentos' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Vestuário' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Outro' })).toBeTruthy();
  });

  it('envia categoria personalizada, código numérico, validade e imagem', async () => {
    const user = userEvent.setup();
    api.criarProduto.mockResolvedValue({
      ok: true,
      data: { mensagem: 'Produto cadastrado com sucesso!' },
    });
    render(<ProdutoPage />);

    await user.type(screen.getByLabelText('Nome do Produto *'), 'Produto de teste');
    await user.type(screen.getByLabelText('Código de Barras'), '123abc45');
    await user.type(screen.getByLabelText('Descrição *'), 'Descrição do produto');
    await user.type(screen.getByLabelText('Quantidade em Estoque'), '7');
    await user.selectOptions(screen.getByLabelText('Categoria *'), 'Outro');
    await user.type(screen.getByLabelText('Especifique a Categoria *'), 'Papelaria');
    await user.type(screen.getByLabelText('Data de Validade (se aplicável)'), '2027-10-31');
    const image = new File(['image'], 'produto.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Imagem do Produto (se aplicável)'), image);
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => expect(api.criarProduto).toHaveBeenCalledOnce());
    const payload = api.criarProduto.mock.calls[0][0];
    expect(payload.get('codigo_barras')).toBe('12345');
    expect(payload.get('categoria')).toBe('Papelaria');
    expect(payload.get('data_validade')).toBe('2027-10-31');
    expect(payload.get('imagem').name).toBe('produto.png');
    expect(screen.getByRole('alert').textContent).toBe('Produto cadastrado com sucesso!');
  });

  it('mostra mensagem de código duplicado e erros dos campos obrigatórios', async () => {
    const user = userEvent.setup();
    api.criarProduto
      .mockResolvedValueOnce({
        ok: false,
        data: { mensagem: 'Produto com este código de barras já está cadastrado!' },
      })
      .mockResolvedValueOnce({
        ok: false,
        data: {
          mensagem: 'Dados inválidos.',
          erros: {
            nome: 'Nome obrigatório.',
            descricao: 'Descrição obrigatória.',
            categoria: 'Categoria obrigatória.',
          },
        },
      });
    render(<ProdutoPage />);

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Produto com este código de barras já está cadastrado!'
    );
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));
    expect(await screen.findByText('Nome obrigatório.')).toBeTruthy();
    expect(screen.getByText('Descrição obrigatória.')).toBeTruthy();
    expect(screen.getByText('Categoria obrigatória.')).toBeTruthy();
  });
});