const express = require('express');
const router = express.Router();
const ProfileType = require('../models/ProfileType');

router.post('/', async (req, res) => {
  try {
    const profileType = await ProfileType.create(req.body);
    res.status(201).json(profileType);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar tipo de perfil' });
  }
});


module.exports = router;
