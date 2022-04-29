const User = require('../models/user').userModel;

// If non-existent, create default users in database
async function populateDatabase() {
	// Check existance of a basic user and create if needed
	const basicUser = await User.findOne({ authServiceUserId: 123 });
	if (!basicUser) {
		const newBasicUser = new User({
			authServiceUserId: 123,
		});
		await newBasicUser.save();
	}

	// Check existance of a premium user and create if needed
	const premiumUser = await User.findOne({ authServiceUserId: 434 });
	if (!premiumUser) {
		const newPremiumUser = new User({
			authServiceUserId: 434,
			role: 'premium',
		});
		await newPremiumUser.save();
	}
}

module.exports = populateDatabase;
