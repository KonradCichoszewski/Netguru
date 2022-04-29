const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
	title: String,
	genre: String,
	director: String,
	released: Date,
});

const movieModel = mongoose.model('Movie', movieSchema);

module.exports = { movieSchema, movieModel };
