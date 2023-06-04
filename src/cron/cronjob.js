const axios = require('axios');
const mongoose = require('mongoose');
const Character = require('../models/characterModel');

// Conectar a la base de datos
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Conexión exitosa a MongoDB');
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
  });

// Función para obtener las citas desde la API externa
async function fetchQuotes() {
  try {
    const response = await axios.get('http://animechan.melosh.space/quotes');
    return response.data;
  } catch (error) {
    console.error('Error al obtener las citas:', error);
    return [];
  }
}

// Función para verificar y actualizar los personajes en la base de datos
async function updateCharacters() {
  const quotes = await fetchQuotes();
  for (const quote of quotes) {
    const { anime, character } = quote;
    const existingCharacter = await Character.findOne({
      anime,
      name: character,
    });

    if (existingCharacter) {
      const existingQuote = existingCharacter.quotes.find(
        q => q.quote === quote.quote
      );
      if (!existingQuote) {
        existingCharacter.quotes.push({ quote: quote.quote });
        await existingCharacter.save();
      }
    } else {
      const newCharacter = new Character({
        name: character,
        anime,
        imageURL: '',
        quotes: [{ quote: quote.quote }],
      });
      await newCharacter.save();
    }
  }
}

// Ejecutar el cronjob cada 2 minutos :)
setInterval(async () => {
  try {
    await updateCharacters();
    console.log('Cronjob ejecutado con éxito');
  } catch (error) {
    console.error('Error al ejecutar el cronjob:', error);
  }
}, 2 * 60 * 1000); // 2 minutos en milisegundos

module.exports = updateCharacters;
