/* istanbul ignore file */

function loggedIn(req, res, next) {
	if (req.user) {
		if (req.user.account_status === 'Inactive') {
			req.logout();
			res.redirect('/login');
		} else {
			next();
		}
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

function PrivilegeLevel(req, res, next) {
	if (req.user.privilege_level === 'Citizen') {
		console.log(req.user.privilege_level);
		//var err = new Error("denied");
		//res.locals.message = "You are not authorized to access the resource.";
		res.status(403).render('error');
		return;
	} else {
		next();
	}
}

module.exports = {
	loggedIn: loggedIn,
	notLoggedIn: notLoggedIn,
	PrivilegeLevel: PrivilegeLevel
};