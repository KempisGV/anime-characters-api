const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Anime = mongoose.model('Anime', animeSchema);

module.exports = Anime;
