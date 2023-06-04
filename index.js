const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const CronJob = require('cron').CronJob;

const app = express();
dotenv.config({ path: './config.env' });
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8000;
const dbURL = process.env.MONGODB_URI;

// Configurar Multer para manejar la carga de imágenes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Conectar a la base de datos
mongoose
  .set('strictQuery', true)
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Definir el esquema y modelo de los personajes
const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  anime: {
    type: String,
    required: true,
  },
  imageURL: {
    type: String,
    required: true,
  },
  quotes: [
    {
      quote: {
        type: String,
        required: true,
      },
    },
  ],
});

const Character = mongoose.model('Character', characterSchema);

// Rutas de la API REST
app.get('/characters', async (req, res) => {
  try {
    const characters = await Character.find();
    res.json(characters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los personajes' });
  }
});

app.post('/characters', async (req, res) => {
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

// Ejecutar el cronjob cada 36 segundos (100 veces por hora)
const job = new CronJob('*/36 * * * * *', updateCharacters);
job.start();

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
