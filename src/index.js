const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const characterRoutes = require('./routes/characterRoutes');
// const cronjob = require('./cron/cronjob');

const app = express();
dotenv.config({ path: './config.env' });
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8000;
const dbURL = process.env.MONGODB_URI;

// Conectar a la base de datos
mongoose
  .set('strictQuery', true)
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Rutas de la API REST
app.use('/characters', characterRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});

// Ejecutar el cronjob al hacer deploy en Vercel
// cronjob();
