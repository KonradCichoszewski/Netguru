const express = require('express');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');

const moviesRouter = require('./routes/movies');

// Create Express instance
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Add route handlers
app.use('/movies', moviesRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	// res.locals.message = err.message;
	// res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.status(err.status || 500);
	res.send({ error: err });
});

// Export configured Express instance
module.exports = app;
