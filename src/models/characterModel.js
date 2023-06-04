const mongoose = require('mongoose');

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

module.exports = mongoose.model('Character', characterSchema);
