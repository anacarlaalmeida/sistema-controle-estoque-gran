FACULDADE GRAN (https://faculdade.grancursosonline.com.br/)
Projeto Disciplina Projeto Integrador

# Sistema de Controle de Estoque — Projeto Integrador Full Stack

Sistema completo de Controle de Estoque composto por **Backend (Node.js + Express + SQLite)** e **Frontend (React.js + Vite)**, desenvolvido para a disciplina **Projeto Integrador** da **Faculdade Gran**.

---

## Estrutura do Repositório

- [`./backend`](./backend): API RESTful em Node.js, Express e SQLite com CRUD completo e regras de negócio para **Fornecedores**, **Produtos** e **Associação Produto/Fornecedor (N:N)**, além de coleção do Insomnia e testes automatizados.
- [`./frontend`](./frontend): Aplicação cliente em React.js consumindo a API do backend com as 3 telas especificadas nos protótipos descritivos:
  1. **Cadastro de Fornecedor**
  2. **Cadastro de Produto**
  3. **Associação de Fornecedor a Produto**

---

## Como Executar o Projeto Completo

### 1. Iniciar o Backend (Porta `3000`)

```bash
cd backend
npm install
npm start
```
O servidor backend estará disponível em `http://localhost:3000/`.

### 2. Iniciar o Frontend (Porta `5173`)

Em outro terminal:

```bash
cd frontend
npm install
npm start
```
A aplicação React estará disponível em `http://localhost:5173/`.
