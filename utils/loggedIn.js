/* istanbul ignore file */

function loggedIn(req, res, next) {
	if (req.user) {
		next();
	} else {
		res.redirect('/login');
	}
}

function notLoggedIn(req, res, next) {
	if (req.user) {
		res.redirect('/rooms/000000000000000000000000');
	} else {
		next();
	}
}

module.exports = {
	loggedIn: loggedIn,
	notLoggedIn: notLoggedIn
};