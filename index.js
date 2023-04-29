const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8000;
const dbURL  = process.env.MONGODB_URI;;

// Configurar Multer para manejar la carga de imágenes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Conectar a la base de datos
mongoose.connect(dbURL, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   useCreateIndex: true,
   useFindAndModify: false
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

app.post('/characters', upload.single('image'), async (req, res) => {
   try {
      const { name, anime } = req.body;
      const imageURL = req.file.buffer.toString('base64');
      const character = new Character({ name, anime, imageURL });
      await character.save();
      res.json({ message: 'Personaje guardado correctamente' });
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al guardar el personaje' });
   }
});

// Iniciar el servidor
app.listen(PORT, () => {
   console.log(`Servidor iniciado en el puerto ${PORT}`);
});
