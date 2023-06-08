const express = require('express');
const Anime = require('../models/animeModel');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const animes = await Anime.find({}, { name: 1, _id: 0 }); // Obtiene solo el campo "name" y excluye el campo "_id"
    const animeNames = animes.map(anime => anime.name);
    res.json(animeNames);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los animes' });
  }
});

module.exports = router;
