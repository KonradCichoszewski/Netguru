// Create a timestamp of the beginning of upcoming month
function setNextMonth() {
	const now = new Date();
	const currentYear = now.getFullYear();
	const nextMonthIndex = now.getMonth() + 1;
	const nextMonthDate = new Date(currentYear, nextMonthIndex, 1);
	const nextMonthTimestamp = Date.parse(nextMonthDate);
	return nextMonthTimestamp;
}

module.exports = setNextMonth;
