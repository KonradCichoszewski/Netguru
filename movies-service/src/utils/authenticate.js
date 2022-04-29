const jwt = require('jsonwebtoken');

// Verify JWT token, return decoded user data or error
function authenticate(token) {
	const options = {
		issuer: 'https://www.netguru.com/',
	};

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET, options);
		const { userId, role } = decoded;
		const userData = { id: userId, role };
		return {
			authError: null,
			userData,
		};
	} catch (err) {
		return {
			authError: err,
		};
	}
}

module.exports = authenticate;
