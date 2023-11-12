const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  // criacao de entidades
  db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        password TEXT,
        profileType TEXT,
        name TEXT
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

  const rolesToAdd = ['PROFESSOR', 'ADMINISTRACAO', 'ALUNO'];
  const roleInsert = db.prepare('INSERT INTO roles (roleName) VALUES (?)');

  rolesToAdd.forEach((roleName) => {
    roleInsert.run(roleName);
  });

  roleInsert.finalize();
});

// Rotas

// Autenticacao
router.post('/login', async (req, res) => {
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

// criacao usuario

router.post('/users', async (req, res) => {
  const { username, password, profileType, name, roleName } = req.body;

  if (!roleName || !rolesToAdd.includes(roleName)) {
    return res.status(400).send('A role fornecida é inválida.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    'INSERT INTO users (username, password, profileType, name) VALUES (?, ?, ?, ?)',
    [username, hashedPassword, profileType, name],
    async function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Erro ao adicionar usuário');
      }

      const userId = this.lastID;

      // Associando usuários aos papéis padrão
      const roleId = await getRoleId(roleName);
      if (roleId) {
        db.run('INSERT INTO user_roles (userId, roleId) VALUES (?, ?)', userId, roleId);
      }

      res.send('Usuário adicionado com sucesso');
    }
  );
});

async function getRoleId(roleName) {
  return new Promise((resolve) => {
    db.get('SELECT id FROM roles WHERE roleName = ?', [roleName], (err, row) => {
      if (err) {
        console.error(err.message);
        resolve(null);
      } else {
        resolve(row ? row.id : null);
      }
    });
  });
}

module.exports = router;