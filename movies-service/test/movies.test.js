const mongoose = require('mongoose');
const axios = require('axios');
const supertest = require('supertest');

const app = require('../src/app');
const populateDatabase = require('../src/utils/populateDatabase');
const User = require('../src/models/user').userModel;

axios.post;

// Retrieve username and password for database connection
const { MONGODB_USERNAME, MONGODB_PASSWORD } = process.env;

// Declare variables for tokens to be used in tests
let basicToken;
let premiumToken;

// Before each test, connect to database and get tokens
beforeEach((done) => {
	mongoose.connect(
		`mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@mongodb:27017/test?authSource=admin`,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		async () => {
			// Populate database with default users
			await populateDatabase();

			// Get tokens for use in all tests
			const basicResponse = await axios.post(
				'http://authentication:3000/auth/',
				{
					username: 'basic-thomas',
					password: 'sR-_pcoow-27-6PAwCD8',
				}
			);
			basicToken = basicResponse.data.token;

			const premiumResponse = await axios.post(
				'http://authentication:3000/auth/',
				{
					username: 'premium-jim',
					password: 'GBLtTyq3E_UNjFnpo9m6',
				}
			);
			premiumToken = premiumResponse.data.token;

			done();
		}
	);
});

// After each test, drop database and disconnect
afterEach((done) => {
	mongoose.connection.db.dropDatabase(() => {
		mongoose.connection.close(() => done());
	});
});

// Test 'GET' method on '/movies' route
describe('GET /movies', () => {
	describe('given incorrect route name', () => {
		test('should return 404 status code', async () => {
			await supertest(app).get('/moviez').expect(404);
		});
	});

	describe('given no Authorization header', () => {
		test('should return 403 status code and "Token missing" message', async () => {
			await supertest(app)
				.get('/movies')
				.expect(403)
				.then((response) => {
					expect(response.body.error.message).toEqual('Token missing');
				});
		});
	});

	describe('given malformed Authorization header', () => {
		describe('- missing "Bearer" keyword', () => {
			test('should return 403 status code and "Token missing" error messsage', async () => {
				await supertest(app)
					.get('/movies')
					.set('Authorization', basicToken)
					.expect(403)
					.then((response) => {
						expect(response.body.error.message).toEqual('Token missing');
					});
			});
		});

		describe('- misspelled "Bearer" keyword', () => {
			test('should return 403 status code and "Token missing" error messsage', async () => {
				await supertest(app)
					.get('/movies')
					.set('Authorization', `Bearr ${basicToken}`)
					.expect(403)
					.then((response) => {
						expect(response.body.error.message).toEqual('Token missing');
					});
			});
		});

		describe('- missing space between "Bearer" and token', () => {
			test('should return 403 status code and "Token missing" error messsage', async () => {
				await supertest(app)
					.get('/movies')
					.set('Authorization', `Bearer${basicToken}`)
					.expect(403)
					.then((response) => {
						expect(response.body.error.message).toEqual('Token missing');
					});
			});
		});
	});

	describe('given invalid token', () => {
		test('should return 403 status code and "Invalid token" error message', async () => {
			await supertest(app)
				.get('/movies')
				.set('Authorization', `Bearer invalidToken`)
				.expect(403)
				.then((response) => {
					expect(response.body.error.message).toEqual('Invalid token');
				});
		});
	});

	describe('given successful authorization, but missing user in database', () => {
		test('should return 404 status code', async () => {
			await User.findOneAndDelete({ authServiceUserId: 123 });
			await supertest(app)
				.get('/movies')
				.set('Authorization', `Bearer ${basicToken}`)
				.expect(404);
		});
	});

	describe('given no movies created for any user', () => {
		test('should return 200 status code and empty array for basic user', async () => {
			await supertest(app)
				.get('/movies')
				.set('Authorization', `Bearer ${basicToken}`)
				.expect(200)
				.then((response) => {
					// Check the response type and length
					expect(Array.isArray(response.body)).toBeTruthy();
					expect(response.body.length).toEqual(0);
				});
		});

		test('should return 200 status code and empty array for premium user', async () => {
			await supertest(app)
				.get('/movies')
				.set('Authorization', `Bearer ${premiumToken}`)
				.expect(200)
				.then((response) => {
					// Check the response type and length
					expect(Array.isArray(response.body)).toBeTruthy();
					expect(response.body.length).toEqual(0);
				});
		});
	});

	describe('given one movie created for each user', () => {
		test('should return 200 status code and array with one movie for basic user', async () => {
			const basicUser = await User.findOne({ authServiceUserId: 123 });
			basicUser.movies.push({});
			await basicUser.save();

			await supertest(app)
				.get('/movies')
				.set('Authorization', `Bearer ${basicToken}`)
				.expect(200)
				.then((response) => {
					// Check the response type and length
					expect(Array.isArray(response.body)).toBeTruthy();
					expect(response.body.length).toEqual(1);
				});
		});

		test('should return 200 status code and array with one movie for premium user', async () => {
			const premiumUser = await User.findOne({ authServiceUserId: 434 });
			premiumUser.movies.push({});
			await premiumUser.save();

			await supertest(app)
				.get('/movies')
				.set('Authorization', `Bearer ${premiumToken}`)
				.expect(200)
				.then((response) => {
					// Check the response type and length
					expect(Array.isArray(response.body)).toBeTruthy();
					expect(response.body.length).toEqual(1);
				});
		});
	});
});

// Test 'POST' method on '/movies' route
describe('POST /movies', () => {
	describe('given incorrect route name', () => {
		test('should return 404 status code', async () => {
			await supertest(app).post('/moviez').expect(404);
		});
	});

	describe('given no Authorization header', () => {
		test('should return 403 status code and "Token missing" message', async () => {
			await supertest(app)
				.post('/movies')
				.expect(403)
				.then((response) => {
					expect(response.body.error.message).toEqual('Token missing');
				});
		});
	});

	describe('given malformed Authorization header', () => {
		describe('- missing "Bearer" keyword', () => {
			test('should return 403 status code and "Token missing" error messsage', async () => {
				await supertest(app)
					.post('/movies')
					.set('Authorization', basicToken)
					.expect(403)
					.then((response) => {
						expect(response.body.error.message).toEqual('Token missing');
					});
			});
		});

		describe('- misspelled "Bearer" keyword', () => {
			test('should return 403 status code and "Token missing" error messsage', async () => {
				await supertest(app)
					.post('/movies')
					.set('Authorization', `Bearr ${basicToken}`)
					.expect(403)
					.then((response) => {
						expect(response.body.error.message).toEqual('Token missing');
					});
			});
		});

		describe('- missing space between "Bearer" and token', () => {
			test('should return 403 status code and "Token missing" error messsage', async () => {
				await supertest(app)
					.post('/movies')
					.set('Authorization', `Bearer${basicToken}`)
					.expect(403)
					.then((response) => {
						expect(response.body.error.message).toEqual('Token missing');
					});
			});
		});
	});

	describe('given invalid token', () => {
		test('should return 403 status code and "Invalid token" error message', async () => {
			await supertest(app)
				.post('/movies')
				.set('Authorization', `Bearer invalidToken`)
				.expect(403)
				.then((response) => {
					expect(response.body.error.message).toEqual('Invalid token');
				});
		});
	});

	describe('given successful authorization, but missing user in database', () => {
		test('should return 404 status code', async () => {
			await User.findOneAndDelete({ authServiceUserId: 123 });
			await supertest(app)
				.post('/movies')
				.set('Authorization', `Bearer ${basicToken}`)
				.expect(404);
		});
	});

	describe('given user eligible to reset thier monthly movies count', () => {
		test('should reset their monthly movies count and set new reset timestamp', async () => {
			const basicUser = await User.findOne({ authServiceUserId: 123 });
			basicUser.countResetAfter = Date.parse(new Date(2000, 0, 1));
			basicUser.moviesCurrentMonth = 1000;
			await basicUser.save();

			await supertest(app)
				.post('/movies')
				.set('Authorization', `Bearer ${basicToken}`)
				.send({ title: 'Star Wars' })
				.expect(200);

			const basicUserAgain = await User.findOne({ authServiceUserId: 123 });
			expect(basicUserAgain.countResetAfter > Date.now());
			expect(basicUserAgain.moviesCurrentMonth === 1);
		});
	});

	describe('given basic user who exceeded their monthly movies limit', () => {
		test('should return 403 status code and appropriate error message', async () => {
			const basicUser = await User.findOne({ authServiceUserId: 123 });
			basicUser.moviesCurrentMonth = 1000;
			await basicUser.save();

			await supertest(app)
				.post('/movies')
				.set('Authorization', `Bearer ${basicToken}`)
				.send({ title: 'Star Wars' })
				.expect(403)
				.then((response) => {
					expect(response.body.error.message).toEqual(
						'Monthly limit reached for basic user'
					);
				});
		});
	});

	describe('given premium user who exceeded monthly movies limit for basic users', () => {
		test('should ignore it and succeed, returning 200 status code and a movie', async () => {
			const premiumUser = await User.findOne({ authServiceUserId: 434 });
			premiumUser.moviesCurrentMonth = 1000;
			await premiumUser.save();

			await supertest(app)
				.post('/movies')
				.set('Authorization', `Bearer ${premiumToken}`)
				.send({ title: 'Star Wars' })
				.expect(200)
				.then((response) => {
					expect(response.body.recordSaved).toEqual(true);
					expect(response.body.movie).toBeTruthy();
				});
		});
	});

	describe('given invalid "title" field in request body', () => {
		describe(' - missing "title" field', () => {
			test('should return 400 status code and "No title provided" error message', async () => {
				await supertest(app)
					.post('/movies')
					.set('Authorization', `Bearer ${basicToken}`)
					.expect(400)
					.then((response) => {
						expect(response.body.error.message).toEqual('No title provided');
					});
			});
		});

		describe(' - "title" field filled with whitespace only', () => {
			test('should return 400 status code and "No title provided" error message', async () => {
				await supertest(app)
					.post('/movies')
					.set('Authorization', `Bearer ${basicToken}`)
					.send({ title: ' ' })
					.expect(400)
					.then((response) => {
						expect(response.body.error.message).toEqual('No title provided');
					});
			});
		});
	});

	describe('given "title" field which does not match any record in OMDb', () => {
		test('should return 404 status code and "Movie not found" error message', async () => {
			await supertest(app)
				.post('/movies')
				.set('Authorization', `Bearer ${basicToken}`)
				.send({ title: 'ndn783qcnt7aef8gaeh237taeisfgztdsga7tv4atieu' })
				.expect(404)
				.then((response) => {
					expect(response.body.error.message).toEqual('Movie not found');
				});
		});
	});

	describe('given all correct data', () => {
		test('should succeed, returning 200 status code and a movie', async () => {
			await supertest(app)
				.post('/movies')
				.set('Authorization', `Bearer ${premiumToken}`)
				.send({ title: 'Star Wars' })
				.expect(200)
				.then((response) => {
					expect(response.body.recordSaved).toEqual(true);
					expect(response.body.movie).toBeTruthy();
				});
		});
	});
});
