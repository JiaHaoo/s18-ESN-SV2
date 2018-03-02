function loggedIn(req, res, next) {
	if (req.user) {
		next();
	} else {
		res.redirect('/login');
	}
}

function notLoggedIn(req, res, next) {
	if (req.user) {
		res.redirect('/v1/users/' + req.user.username);
	} else {
		next();
	}
}

module.exports = {
	loggedIn: loggedIn,
	notLoggedIn: notLoggedIn
};