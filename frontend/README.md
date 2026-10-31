FACULDADE GRAN (https://faculdade.grancursosonline.com.br/)
Projeto Disciplina Projeto Integrador

# Sistema de Controle de Estoque — Frontend (React.js)

Aplicação web desenvolvida em **React.js** (com **Vite**) para gerenciamento completo de **Fornecedores**, **Produtos** e **Associação Produto/Fornecedor (N:N)**, integrada à API REST do Backend (`http://localhost:3000`).

---

## Funcionalidades e Páginas Implementadas

1. **Página de Cadastro e Gerenciamento de Fornecedor (`Cadastro de Fornecedor`)**
   - Cabeçalho com título `"Cadastro de Fornecedor"` e botão de voltar/fechar.
   - Campos obrigatórios com placeholders e formatação exigidos no protótipo:
     - **Nome da Empresa:** `"Insira o nome da empresa"`
     - **CNPJ:** `"00.000.000/0000-00"` (com máscara automática)
     - **Endereço:** `"Insira o endereço completo da empresa"`
     - **Telefone:** `"(00) 0000-0000"` (com máscara automática)
     - **E-mail:** `"exemplo@fornecedor.com"`
     - **Contato Principal:** `"Nome do contato principal"`
   - Botão `"Cadastrar"` integrado ao backend exibindo:
     - 1º Cenário (Sucesso): `"Fornecedor cadastrado com sucesso!"`
     - 2º Cenário (CNPJ duplicado): `"Fornecedor com esse CNPJ já está cadastrado!"`
     - 3º Cenário (Campos inválidos/em branco): mensagens de erro exibidas ao lado/abaixo de cada campo inválido.
   - Listagem de fornecedores cadastrados com suporte a edição, exclusão e consulta de produtos fornecidos.

2. **Página de Cadastro e Gerenciamento de Produto (`Cadastro de Produto`)**
   - Cabeçalho com título `"Cadastro de Produto"` e botão de voltar/fechar.
   - Campos conforme o protótipo descritivo:
     - **Nome do Produto (obrigatório):** `"Insira o nome do produto"`
     - **Código de Barras:** `"Insira o código de barras"`
     - **Descrição (obrigatório):** `"Descreva brevemente o produto"` (múltiplas linhas)
     - **Quantidade em Estoque:** `"Quantidade disponível"`
     - **Categoria (obrigatório):** Dropdown com `"Eletrônicos"`, `"Alimentos"`, `"Vestuário"` e `"Outro"` (com campo para especificar categoria personalizada)
     - **Data de Validade:** `"Selecione a data de validade"`
     - **Imagem do Produto:** Upload de arquivo representativo do produto
   - Botão `"Cadastrar"` integrado ao backend exibindo:
     - 1º Cenário (Sucesso): `"Produto cadastrado com sucesso!"`
     - 2º Cenário (Código de barras duplicado): `"Produto com este código de barras já está cadastrado!"`
     - 3º Cenário (Campos inválidos/em branco): mensagens de erro exibidas ao lado/abaixo de cada campo inválido.
   - Listagem de produtos com ações de editar, excluir e atalho direto para `"Associar Fornecedor"`.

3. **Página de Associação de Fornecedor a Produto (`Associação de Fornecedor a Produto`)**
   - Cabeçalho com título `"Associação de Fornecedor a Produto"` e botão de voltar/fechar.
   - **Seção Detalhes do Produto (Somente Leitura):** exibe Nome do Produto, Código de Barras, Descrição e Miniatura da Imagem.
   - **Seção Associação de Fornecedor:** dropdown com placeholder `"Selecione um fornecedor"` e botão `"Associar Fornecedor"`.
   - **Seção Fornecedores Associados:** tabela listando `Nome do Fornecedor`, `CNPJ` e botão `"Desassociar"` para cada item.
   - Exibição das mensagens exatas dos 3 cenários:
     - `"Fornecedor associado com sucesso ao produto!"`
     - `"Fornecedor já está associado a este produto!"`
     - `"Fornecedor desassociado com sucesso!"`

---

## Como Executar o Frontend

1. Certifique-se de que o **backend** está rodando em `http://localhost:3000`:
   ```bash
   cd ../backend
   npm start
   ```

2. Em outro terminal, acesse a pasta `frontend`, instale as dependências e inicie o servidor:
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. Acesse no navegador:
   ```text
   http://localhost:5173
   ```

