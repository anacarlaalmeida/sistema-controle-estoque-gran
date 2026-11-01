FACULDADE GRAN (https://faculdade.grancursosonline.com.br/)
Projeto Disciplina Projeto Integrador

# Sistema de Controle de Estoque — Projeto Integrador Full Stack

Sistema completo de Controle de Estoque composto por **Backend (Node.js + Express + SQLite)** e **Frontend (React.js + Vite)**, desenvolvido para a disciplina **Projeto Integrador** da **Faculdade Gran**.

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

## Execução Completa com Docker Compose

Com Docker e Docker Compose instalados, execute na raiz do projeto:

```bash
docker compose up --build
```

A aplicação estará em `http://localhost:5173/` e a API em
`http://localhost:3000/`. O Compose aguarda a API ficar pronta antes de iniciar
o frontend e persiste o banco SQLite e os uploads em volumes Docker.

Para encerrar os serviços sem apagar esses dados, pressione `Ctrl+C` e execute:

```bash
docker compose down
```
