const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : path.resolve(__dirname, 'database.sqlite');

let dbInstance = null;

function getDb() {
  if (!dbInstance) {
    dbInstance = new sqlite3.Database(DB_PATH);
    dbInstance.run('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}

function run(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function initDb() {
  const db = getDb();
  await run(`
    CREATE TABLE IF NOT EXISTS fornecedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_empresa TEXT NOT NULL,
      cnpj TEXT UNIQUE NOT NULL,
      endereco TEXT NOT NULL,
      telefone TEXT NOT NULL,
      email TEXT NOT NULL,
      contato_principal TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      codigo_barras TEXT UNIQUE,
      descricao TEXT NOT NULL,
      quantidade_estoque INTEGER DEFAULT 0,
      categoria TEXT NOT NULL,
      data_validade TEXT,
      imagem TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS produto_fornecedor (
      produto_id INTEGER NOT NULL,
      fornecedor_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (produto_id, fornecedor_id),
      FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
      FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE CASCADE
    );
  `);
}

function closeDb() {
  return new Promise((resolve, reject) => {
    if (!dbInstance) return resolve();
    dbInstance.close((err) => {
      if (err) return reject(err);
      dbInstance = null;
      resolve();
    });
  });
}

module.exports = {
  getDb,
  run,
  get,
  all,
  initDb,
  closeDb,
};
