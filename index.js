const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const dotenv = require('dotenv')
const cors = require('cors')

const app = express();
dotenv.config({path: './config.env'});
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8000;
const dbURL  = process.env.MONGODB_URI;

// Configurar Multer para manejar la carga de imágenes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Conectar a la base de datos
mongoose
   .set("strictQuery", true)
   .connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
}).then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Definir el esquema y modelo de los personajes
const characterSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true
   },
   anime: {
      type: String,
      required: true
   },
   imageURL: {
      type: String,
      required: true
   }
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

// Iniciar el servidor
app.listen(PORT, () => {
   console.log(`Servidor iniciado en el puerto ${PORT}`);
});
