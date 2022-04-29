const http = require('http');
const mongoose = require('mongoose');
const debug = require('debug')('movies-svc:server');

const app = require('./app');
const populateDatabase = require('./utils/populateDatabase');

// Retrieve username and password for database connection
const { MONGODB_USERNAME, MONGODB_PASSWORD } = process.env;

// Connect to database
mongoose.connect(
	`mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@mongodb:27017/movies?authSource=admin`,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	(error) => {
		if (!error) {
			console.log('Connected to database');

			// In case of empty database, populate with default users
			populateDatabase();
		} else {
			console.error('Connection to database failed');
			throw error;
		}
	}
);

// Get port from environment and store in Express
const port = process.env.MOVIES_PORT ?? '3000';
app.set('port', port);

// Create HTTP server
const server = http.createServer(app);

// Listen on provided port, on all network interfaces and add "listening" event
// listener
server.listen(port, () => {
	const addr = server.address();
	console.log('Listening on port ' + addr.port);
});

// Add event listener for HTTP server "error" event
server.on('error', (error) => {
	if (error.syscall !== 'listen') {
		throw error;
	}

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(`Port ${port} requires elevated privileges`);
			process.exit(1);
		case 'EADDRINUSE':
			console.error(`Port ${port} is already in use`);
			process.exit(1);
		default:
			throw error;
	}
});
