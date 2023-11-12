const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const user = require('./services/user');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use("/user", user);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;