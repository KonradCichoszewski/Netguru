// Check the correctness of the Authorization header and return a token
function checkToken(authHeader) {
	if (!authHeader || typeof authHeader !== 'string') return null;
	const authArray = authHeader.split(' ');
	if (authArray.length !== 2) return null;
	if (authArray[0] !== 'Bearer') return null;
	return authArray[1];
}

module.exports = checkToken;
