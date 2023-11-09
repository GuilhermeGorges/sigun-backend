const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/mongodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado ao MongoDB');
}).catch((err) => {
  console.error('Erro ao conectar ao MongoDB: ' + err);
});

app.use(express.json());

app.listen(port, () => {
  console.log(`Servidor está ouvindo na porta ${port}`);
});


const usersRouter = require('./routes/users');
const profileTypesRouter = require('./routes/profileTypes');

app.use('/users', usersRouter);
app.use('/profile-types', profileTypesRouter);
