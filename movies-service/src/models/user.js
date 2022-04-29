const mongoose = require('mongoose');

const { movieSchema } = require('./movie');
const setNextMonth = require('../utils/dates');

function required(type) {
	return {
		type: type,
		required: true,
	};
}

function requiredWithDefault(type, defaultValue) {
	return {
		type: type,
		required: true,
		default: defaultValue,
	};
}

const userSchema = new mongoose.Schema({
	authServiceUserId: required(Number),
	role: requiredWithDefault(String, 'basic'),
	movies: requiredWithDefault([movieSchema], []),
	countResetAfter: requiredWithDefault(Number, setNextMonth()),
	moviesCurrentMonth: requiredWithDefault(Number, 0),
});

const userModel = mongoose.model('User', userSchema);

module.exports = { userSchema, userModel };
