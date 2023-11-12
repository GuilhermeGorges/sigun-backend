const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { db, getRoleId, getRoles } = require('./../entities/entities');


// autenticacao
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
  const { username, password, profileType, name } = req.body;

  const usersRoles = getRoles();

  if (!profileType || !usersRoles.includes(profileType.trim())) {
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
      const roleId = await getRoleId(profileType);
      if (roleId) {
        db.run('INSERT INTO user_roles (userId, roleId) VALUES (?, ?)', userId, roleId);
      }

      res.send('Usuário adicionado com sucesso');
    }
  );
});

module.exports = router;