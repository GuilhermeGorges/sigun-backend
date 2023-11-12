const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
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
          id INTEGER PRIMARY KEY,
          roleId INTEGER,
          functionName TEXT,
          icon TEXT,
          FOREIGN KEY (roleId) REFERENCES roles(id)
        )
    `);

    generateRoles(db).then(() => {
      generateFunctionsToRoles(db)
    }) 
});

function getRoles() {
  return ['PROFESSOR', 'ADMINISTRACAO', 'ALUNO'];
}

async function generateRoles(db) {
  const existingRoles = await getExistingRoles();
  const roleInsert = db.prepare('INSERT INTO roles (roleName) VALUES (?)');

  getRoles().forEach((roleName) => {
    if (!existingRoles.includes(roleName)) {
      roleInsert.run(roleName);
    }
  });

  roleInsert.finalize();
}

async function generateFunctionsToRoles(db) {
  const roleName = 'ADMINISTRACAO';

  const functionsToAdd = [
    { functionName: 'Função 1', icon: 'barschart' },
    { functionName: 'Função 2', icon: 'mail' },
    { functionName: 'Função 3', icon: 'laptop' },
    { functionName: 'Função 4', icon: 'home' },
    { functionName: 'Função 5', icon: 'star' },
    { functionName: 'Função 6', icon: 'save' },
    { functionName: 'Função 7', icon: 'team' },
    { functionName: 'Função 8', icon: 'setting' },
  ];

  const results = await Promise.all(
    functionsToAdd.map(async ({ functionName, icon }) => {
      const existingFunctions = await getFunctionsByRole(roleName);
      const functionExists = existingFunctions.some((func) => func.functionName === functionName);

      if (!functionExists) {
        return addFunctionToRole(roleName, functionName, icon);
      }
    })
  );

  const allAddedSuccessfully = results.every((result) => result);

  return allAddedSuccessfully;
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

async function addFunctionToRole(roleName, functionName, icon) {
  const roleId = await getRoleId(roleName);

  if (!roleId) {
    console.error(`Role ${roleName} not found.`);
    return false;
  }

  return new Promise((resolve) => {
    const insertFunction = db.prepare('INSERT INTO role_functions (roleId, functionName, icon) VALUES (?, ?, ?)');
    
    insertFunction.run(roleId, functionName, icon, (err) => {
      if (err) {
        console.error(err.message);
        resolve(false);
      } else {
        resolve(true);
      }
    });

    insertFunction.finalize();
  });
}

module.exports = {
  getRoles,
  db,
  getRoleId,
  getFunctionsByRole,
};