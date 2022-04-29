// Validate input values and return movie object with correct ones
function filterOutInvalidValues({ Title, Released, Genre, Director }) {
	// For Title, Genre and Director check if value is a valid string
	const title = typeof Title === 'string' && Title !== 'N/A' ? Title : null;
	const genre = typeof Genre === 'string' && Genre !== 'N/A' ? Genre : null;
	const director =
		typeof Director === 'string' && Director !== 'N/A' ? Director : null;

	// For Released check if conversion to Date object is successful
	const dateString = new Date(Released).toString();
	const released = dateString !== 'Invalid Date' ? new Date(Released) : null;

	const unfilteredMovie = { title, released, genre, director };
	const movie = {};

	// Only add defined values to the movie object
	for (const value in unfilteredMovie) {
		if (unfilteredMovie[value]) movie[value] = unfilteredMovie[value];
	}

	return movie;
}

module.exports = filterOutInvalidValues;
