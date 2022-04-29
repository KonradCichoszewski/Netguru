const router = require('express').Router();
const axios = require('axios');
const createError = require('http-errors');

const User = require('../models/user').userModel;
const checkToken = require('../utils/checkToken');
const authenticate = require('../utils/authenticate');
const setNextMonth = require('../utils/dates');
const filterOutInvalidValues = require('../utils/movieDataFilter');

// GET /movies
router.get('/', async function (req, res, next) {
	// Check for token and its format in request headers
	const token = checkToken(req.headers.authorization);
	if (!token) return next(createError(403, 'Token missing'));

	// Authenticate user
	const { authError, userData } = authenticate(token);
	if (authError) return next(createError(403, 'Invalid token'));

	// Fetch user from database
	const user = await User.findOne({
		authServiceUserId: userData.id,
	});
	if (!user) return next(createError(404));

	// Return user's movies
	return res.send(user.movies);
});

// POST /movies
router.post('/', async function (req, res, next) {
	// Check for token and its format in request headers
	const token = checkToken(req.headers.authorization);
	if (!token) return next(createError(403, 'Token missing'));

	// Authenticate user
	const { authError, userData } = authenticate(token);
	if (authError) return next(createError(403, 'Invalid token'));

	// Fetch user from database
	const user = await User.findOne({
		authServiceUserId: userData.id,
	});
	if (!user) return next(createError(404));

	// For all users, update current month's movies count
	if (user.countResetAfter <= Date.now()) {
		user.countResetAfter = setNextMonth();
		user.moviesCurrentMonth = 0;
	}

	// For basic users, check monthly limit
	if (
		user.role === 'basic' &&
		user.moviesCurrentMonth >= process.env.MOVIES_PER_MONTH_BASIC
	) {
		return next(createError(403, 'Monthly limit reached for basic user'));
	}

	// Check request body for movie title to be searched
	const { title } = req.body;
	if (typeof title !== 'string' || !title.trim()) {
		return next(createError(400, 'No title provided'));
	}

	// Prepare URL for movies API call
	const { OMDB_API_KEY } = process.env;
	const omdbUrl = `https://omdbapi.com/?apikey=${OMDB_API_KEY}&t=${title.trim()}&r=json`;

	try {
		// Call movies API
		const omdbResponse = await axios.get(omdbUrl);

		// In case no title was matched return 404
		if (omdbResponse.data.Response !== 'True') {
			return next(createError(404, 'Movie not found'));
		}

		// Retreive needed data from response
		const { Title, Released, Genre, Director } = omdbResponse.data;

		// Only add valid values to the movie object
		const movie = filterOutInvalidValues({ Title, Released, Genre, Director });

		// Update user
		user.movies.push(movie);
		user.moviesCurrentMonth++;
		await user.save();

		// Return success confirmation and created movie record
		return res.send({ recordSaved: true, movie });
	} catch (err) {
		// If OMDb service is unreachable, return 500 with appropriate message
		if (err.code === 'EAI_AGAIN') {
			return next(
				createError(
					500,
					'The OMDb API cannot be reached. Check your Internet connection.'
				)
			);
		}

		// Pass other errors to general error handler
		return next(err);
	}
});

module.exports = router;
