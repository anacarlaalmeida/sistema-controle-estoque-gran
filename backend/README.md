FACULDADE GRAN (https://faculdade.grancursosonline.com.br/)
Projeto Disciplina Projeto Integrador

# Sistema de Controle de Estoque — Backend (API REST)

API RESTful desenvolvida em **Node.js**, **Express** e **SQLite** para o gerenciamento de **Produtos**, **Fornecedores** e a **Associação Produto/Fornecedor (N:N)** do Projeto Integrador Full Stack da Faculdade Gran.

---

## Sumário

- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Modelagem do Banco de Dados](#modelagem-do-banco-de-dados)
- [Como Executar o Projeto](#como-executar-o-projeto)
- [Executando os Testes Automatizados](#executando-os-testes-automatizados)
- [Documentação das Rotas (Endpoints)](#documentação-das-rotas-endpoints)
  - [Rota Inicial](#rota-inicial)
  - [Fornecedores (`/fornecedores`)](#1-fornecedores-fornecedores)
  - [Produtos (`/produtos`)](#2-produtos-produtos)
  - [Associação Produto/Fornecedor](#3-associação-produtofornecedor-nn)
- [Testando com o Insomnia](#testando-com-o-insomnia)

---

## Tecnologias Utilizadas

- **Node.js** (Ambiente de execução JavaScript)
- **Express 5** (Framework HTTP para construção da API REST)
- **SQLite3** (Banco de dados relacional embarcado)
- **Multer** (Middleware `multipart/form-data` para upload de imagens de produtos)
- **CORS** (Habilitação de requisições cross-origin para integração com o Frontend React)
- **Node Test Runner (`node --test`)** (Testes unitários de validação e testes de integração HTTP)

---

## Estrutura do Projeto

```text
backend/
├── app.js                         # Configuração do servidor Express, middlewares e rotas
├── package.json                   # Dependências e scripts npm
├── insomnia_collection.json       # Coleção de requisições para importação no Insomnia/Postman
├── controllers/
│   ├── fornecedorController.js    # CRUD e regras de negócio de Fornecedores
│   ├── produtoController.js       # CRUD e regras de negócio de Produtos
│   └── associacaoController.js    # Vínculo, desvínculo e consultas N:N Produto <-> Fornecedor
├── database/
│   ├── db.js                      # Conexão SQLite, helpers Promise e criação das tabelas
│   └── database.sqlite            # Arquivo do banco de dados SQLite (gerado automaticamente)
├── routes/
│   ├── fornecedorRoutes.js        # Rotas de /fornecedores
│   └── produtoRoutes.js           # Rotas de /produtos e associação com fornecedores
├── utils/
│   ├── validators.js              # Validações de campos obrigatórios, CNPJ, telefone, e-mail e estoque
│   └── upload.js                  # Configuração do Multer para armazenamento em /uploads
├── uploads/                       # Diretório onde as imagens enviadas dos produtos são salvas
└── test/
  ├── api.test.js                # Testes HTTP dos controladores, CRUD e associação N:N
  └── validators.test.js         # Testes unitários das regras de validação
```

---

## Modelagem do Banco de Dados

O banco de dados SQLite inicializa automaticamente três tabelas ao subir a aplicação (`initDb()` em `database/db.js`):

1. **`fornecedores`**
   - `id` (`INTEGER PRIMARY KEY AUTOINCREMENT`)
   - `nome_empresa` (`TEXT NOT NULL`)
   - `cnpj` (`TEXT UNIQUE NOT NULL`)
   - `endereco` (`TEXT NOT NULL`)
   - `telefone` (`TEXT NOT NULL`)
   - `email` (`TEXT NOT NULL`)
   - `contato_principal` (`TEXT NOT NULL`)
   - `created_at` (`DATETIME DEFAULT CURRENT_TIMESTAMP`)

2. **`produtos`**
   - `id` (`INTEGER PRIMARY KEY AUTOINCREMENT`)
   - `nome` (`TEXT NOT NULL`)
   - `codigo_barras` (`TEXT UNIQUE`)
   - `descricao` (`TEXT NOT NULL`)
   - `quantidade_estoque` (`INTEGER DEFAULT 0`)
   - `categoria` (`TEXT NOT NULL`)
   - `data_validade` (`TEXT`)
   - `imagem` (`TEXT`)
   - `created_at` (`DATETIME DEFAULT CURRENT_TIMESTAMP`)

3. **`produto_fornecedor`** *(Tabela pivô para relacionamento N:N)*
   - `produto_id` (`INTEGER NOT NULL`, `FOREIGN KEY -> produtos(id) ON DELETE CASCADE`)
   - `fornecedor_id` (`INTEGER NOT NULL`, `FOREIGN KEY -> fornecedores(id) ON DELETE CASCADE`)
   - `created_at` (`DATETIME DEFAULT CURRENT_TIMESTAMP`)
   - `PRIMARY KEY (produto_id, fornecedor_id)`

---

## Como Executar o Projeto

### Opção 1: Execução Local com Node.js (Padrão)

1. Acesse a pasta `backend`:
   ```bash
   cd backend
   ```

2. Instale as dependências (caso ainda não estejam instaladas):
   ```bash
   npm install
   ```

3. Inicie o servidor:
   ```bash
   npm start
   # ou: node app.js
   ```

4. O servidor ficará disponível localmente em:
   ```text
   http://localhost:3000/
   ```

### Opção 2: Execução via Docker / Cloud Run

O backend inclui um `Dockerfile` configurado para execução em container (ouvindo em `0.0.0.0` na porta definida pela variável de ambiente `PORT`, padrão `8080` no container ou `3000` localmente) e compatibilidade automática entre o pacote `sqlite3` e o módulo nativo `node:sqlite` do Node.js 22+:

```bash
cd backend
docker build -t sistema-controle-estoque-gran .
docker run -p 3000:8080 sistema-controle-estoque-gran
```

---

## Executando os Testes Automatizados

O projeto conta com testes unitários para as validações de fornecedor e produto, além de testes de integração HTTP para os cenários da API. Os testes de API usam um banco SQLite em memória (`:memory:`), sem modificar o banco de desenvolvimento.

```bash
cd backend
npm test
```

O comando executa todos os arquivos `test/*.test.js` com o Node Test Runner. `api.test.js` cobre os fluxos HTTP, incluindo CRUD e associação N:N; `validators.test.js` cobre campos obrigatórios, formatos de CNPJ/e-mail/telefone, quantidade em estoque, código de barras e data de validade.

---

## Documentação das Rotas (Endpoints)

### Rota Inicial

- **`GET /`**
  - **Resposta (`200 OK`):** `Olá, Mundo!`

---

### 1. Fornecedores (`/fornecedores`)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/fornecedores` | Lista todos os fornecedores cadastrados |
| `GET` | `/fornecedores/:id` | Busca os detalhes de um fornecedor pelo ID |
| `POST` | `/fornecedores` | Cadastra um novo fornecedor |
| `PUT` | `/fornecedores/:id` | Atualiza os dados de um fornecedor existente |
| `DELETE` | `/fornecedores/:id` | Remove um fornecedor pelo ID |
| `GET` | `/fornecedores/:fornecedorId/produtos` | Lista todos os produtos associados ao fornecedor |

#### Exemplo de Payload (`POST /fornecedores` e `PUT /fornecedores/:id`):
```json
{
  "nome_empresa": "Distribuidora Brasil LTDA",
  "cnpj": "12.345.678/0001-99",
  "endereco": "Av. Paulista, 1000 - São Paulo/SP",
  "telefone": "(11) 98765-4321",
  "email": "contato@distribuidorabrasil.com.br",
  "contato_principal": "Carlos Silva"
}
```

#### Regras de Negócio e Cenários de Retorno:
- **1º Cenário (Sucesso — `201 Created`):**
  - Mensagem: `"Fornecedor cadastrado com sucesso!"`
- **2º Cenário (CNPJ Duplicado — `400 Bad Request`):**
  - Mensagem: `"Fornecedor com esse CNPJ já está cadastrado!"`
- **3º Cenário (Dados Inválidos ou em Branco — `400 Bad Request`):**
  - Mensagem: `"Dados inválidos."` acompanhada do objeto `erros` detalhando cada campo inválido (`nome_empresa`, `cnpj`, `endereco`, `telefone`, `email`, `contato_principal`).

---

### 2. Produtos (`/produtos`)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/produtos` | Lista todos os produtos cadastrados |
| `GET` | `/produtos/:id` | Busca um produto pelo ID (inclui lista de fornecedores associados) |
| `POST` | `/produtos` | Cadastra um novo produto (aceita `application/json` ou `multipart/form-data` com campo `imagem`) |
| `PUT` | `/produtos/:id` | Atualiza um produto existente |
| `DELETE` | `/produtos/:id` | Remove um produto pelo ID |

#### Exemplo de Payload (`POST /produtos` e `PUT /produtos/:id`):
```json
{
  "nome": "Monitor LED 24 Polegadas",
  "codigo_barras": "7891234567890",
  "descricao": "Monitor Full HD 75Hz com entrada HDMI",
  "quantidade_estoque": 15,
  "categoria": "Eletrônicos",
  "data_validade": "2028-12-31"
}
```
*(Para upload de imagem, envie como `multipart/form-data` utilizando o campo `imagem` com arquivo `JPG`, `PNG`, `GIF` ou `WEBP` de até 5MB).*

#### Regras de Negócio e Cenários de Retorno:
- **1º Cenário (Sucesso — `201 Created`):**
  - Mensagem: `"Produto cadastrado com sucesso!"`
- **2º Cenário (Código de Barras Duplicado — `400 Bad Request`):**
  - Mensagem: `"Produto com este código de barras já está cadastrado!"`
- **3º Cenário (Dados Inválidos ou em Branco — `400 Bad Request`):**
  - Mensagem: `"Dados inválidos."` acompanhada do objeto `erros` detalhando cada campo inválido (`nome`, `descricao`, `categoria`, `quantidade_estoque`, `data_validade`).

---

### 3. Associação Produto/Fornecedor (N:N)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/produtos/:produtoId/fornecedores` | Lista todos os fornecedores associados a um produto |
| `POST` | `/produtos/:produtoId/fornecedores` | Associa um fornecedor a um produto |
| `DELETE` | `/produtos/:produtoId/fornecedores/:fornecedorId` | Desassocia um fornecedor de um produto |
| `GET` | `/fornecedores/:fornecedorId/produtos` | Lista todos os produtos fornecidos por um fornecedor |

#### Exemplo de Payload (`POST /produtos/:produtoId/fornecedores`):
```json
{
  "fornecedor_id": 1
}
```

#### Regras de Negócio e Cenários de Retorno:
- **1º Cenário (Associando com sucesso — `201 Created`):**
  - Mensagem: `"Fornecedor associado com sucesso ao produto!"`
- **2º Cenário (Associação duplicada — `400 Bad Request`):**
  - Mensagem: `"Fornecedor já está associado a este produto!"`
- **3º Cenário (Desassociando fornecedor — `200 OK`):**
  - Mensagem: `"Fornecedor desassociado com sucesso!"`

---

## Testando com o Insomnia

Na pasta `backend/` encontra-se o arquivo `insomnia_collection.json`. Para utilizá-lo:
1. Abra o **Insomnia** (ou **Postman**).
2. Clique em **Import** e selecione o arquivo `backend/insomnia_collection.json`.
3. Execute as requisições organizadas nas pastas **Fornecedores**, **Produtos** e **Associação Produto/Fornecedor** com o servidor rodando em `http://localhost:3000`.
