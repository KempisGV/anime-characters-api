const express = require('express');
const Character = require('../models/characterModel');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const randomCharacters = await Character.aggregate([
      { $sample: { size: 20 } },
    ]);

    const charactersWithRandomQuotes = randomCharacters.map(character => {
      if (character.quotes && character.quotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * character.quotes.length);
        character.quote = character.quotes[randomIndex].quote;
      } else {
        character.quote = 'No quote found 😓';
      }
      delete character.quotes; // Eliminar el arreglo de citas original
      return character;
    });

    res.json(charactersWithRandomQuotes);
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

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { imageURL } = req.body;
    const character = await Character.findByIdAndUpdate(
      id,
      { imageURL },
      { new: true }
    );
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    res.json(character);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
