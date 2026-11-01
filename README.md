FACULDADE GRAN (https://faculdade.grancursosonline.com.br/)
Projeto Disciplina Projeto Integrador

# Sistema de Controle de Estoque — Projeto Integrador Full Stack

Sistema completo de Controle de Estoque composto por **Backend (Node.js + Express + SQLite)** e **Frontend (React.js + Vite)**, desenvolvido para a disciplina **Projeto Integrador** da **Faculdade Gran**.

---

## Serviço REST Publicado na Nuvem (Google Cloud Run)

A API REST do projeto está publicada e disponível publicamente no **Google Cloud Run** para testes diretos via **Insomnia** ou **Postman**:

- **URL Base na Nuvem:** `https://sistema-controle-estoque-gran-596069157987.us-central1.run.app`
- **Rotas principais:**
  - `GET /` &rarr; Retorna `"Olá, Mundo!"`
  - `GET /fornecedores` e `POST /fornecedores`
  - `GET /produtos` e `POST /produtos`
  - `GET /produtos/:produtoId/fornecedores`, `POST /produtos/:produtoId/fornecedores` e `DELETE /produtos/:produtoId/fornecedores/:fornecedorId`

---

## Estrutura do Repositório

- [`./backend`](./backend): API RESTful em Node.js, Express e SQLite com CRUD completo e regras de negócio para **Fornecedores**, **Produtos** e **Associação Produto/Fornecedor (N:N)**, além de `Dockerfile`, coleção do Insomnia e testes automatizados.
- [`./frontend`](./frontend): Aplicação cliente em React.js consumindo a API do backend com as 3 telas especificadas nos protótipos descritivos:
  1. **Cadastro de Fornecedor**
  2. **Cadastro de Produto**
  3. **Associação de Fornecedor a Produto**

---

## Como Executar o Projeto Localmente

Os ajustes de containerização (`Dockerfile`) **não alteram** a execução local padrão via Node.js/npm.

### 1. Iniciar o Backend (Porta `3000`)

```bash
cd backend
npm install
npm start
```
O servidor backend estará disponível localmente em `http://localhost:3000/`.

*(Opcional — Executar via Docker)*:
```bash
cd backend
docker build -t estoque-backend .
docker run -p 3000:8080 estoque-backend
```

### 2. Iniciar o Frontend (Porta `5173`)

Em outro terminal:

```bash
cd frontend
npm install
npm start
```
A aplicação React estará disponível em `http://localhost:5173/`.

### Opção 2: aplicação completa com Docker Compose

Na raiz do projeto, execute:

```bash
docker compose up --build
```

A aplicação ficará disponível em `http://localhost:5173/` e a API em
`http://localhost:3000/`. O Compose sobe o frontend e o backend, mantendo o
banco SQLite e os uploads em volumes Docker.

Para encerrar os serviços, pressione `Ctrl+C` e execute:

```bash
docker compose down
```

Esse comando preserva os volumes de dados. Para iniciar novamente sem
reconstruir as imagens, use `docker compose up`.
