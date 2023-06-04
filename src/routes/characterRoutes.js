const express = require('express');
const Character = require('../models/characterModel');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const characters = await Character.find();
    res.json(characters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los personajes' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, anime, imageURL } = req.body;
    const newCharacter = new Character({ name, anime, imageURL });
    await newCharacter.save();
    res.status(201).json(newCharacter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
