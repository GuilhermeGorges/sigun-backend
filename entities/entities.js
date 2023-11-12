const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

db.serialize(async () => {
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

  db.run(`
      CREATE TABLE IF NOT EXISTS role_functions (
          roleId INTEGER,
          functionName TEXT,
          icon TEXT,
          FOREIGN KEY (roleId) REFERENCES roles(id)
        )
    `);

  const existingRoles = await getExistingRoles();
  const roleInsert = db.prepare('INSERT INTO roles (roleName) VALUES (?)');

  getRoles().forEach((roleName) => {
    if (!existingRoles.includes(roleName)) {
      roleInsert.run(roleName);
    }
  });

  roleInsert.finalize();
});

function getRoles() {
  return ['PROFESSOR', 'ADMINISTRACAO', 'ALUNO'];
}

async function getExistingRoles() {
  return new Promise((resolve) => {
    db.all('SELECT roleName FROM roles', (err, rows) => {
      if (err) {
        console.error(err.message);
        resolve([]);
      } else {
        const existingRoles = rows.map(row => row.roleName);
        resolve(existingRoles);
      }
    });
  });
}

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

async function getFunctionsByRole(roleName) {
  const roleId = await getRoleId(roleName);

  if (!roleId) {
    console.error(`Role ${roleName} not found.`);
    return [];
  }

  return new Promise((resolve) => {
    db.all('SELECT functionName, icon FROM role_functions WHERE roleId = ?', [roleId], (err, rows) => {
      if (err) {
        console.error(err.message);
        resolve([]);
      } else {
        const functions = rows.map((row) => ({
          functionName: row.functionName,
          icon: row.icon,
        }));
        resolve(functions);
      }
    });
  });
}

module.exports = {
  getRoles,
  db,
  getRoleId,
  getFunctionsByRole,
};