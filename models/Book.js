const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String },
    publishedYear: { type: Number },
    isAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model('Book', bookSchema);

