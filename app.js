const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      password TEXT,
      name TEXT,
      profileType TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY,
      roleName TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_roles (
      userId INTEGER,
      roleId INTEGER,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (roleId) REFERENCES roles(id)
    )
  `);

  // Autenticacao
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Erro ao autenticar usuário');
      }

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Credenciais inválidas');
      }

      res.json({ message: 'Autenticação bem-sucedida' });
    });
  });

});

// Rotas

app.get('/', (req, res) => {
  res.send('Bem-vindo à API!');
});

app.post('/users', async (req, res) => {
const { username, password, profileType, name } = req.body;

const hashedPassword = await bcrypt.hash(password, 10);

db.run(
    'INSERT INTO users (username, password, name, profileType) VALUES (?, ?, ?, ?)',
    [username, hashedPassword, profileType, name],
    (err) => {
    if (err) {
        console.error(err.message);
        return res.status(500).send('Erro ao adicionar usuário');
    }

    res.send('Usuário adicionado com sucesso');
    }
);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;