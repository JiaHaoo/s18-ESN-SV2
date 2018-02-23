var express = require('express');
var router = express.Router();

// Show Home Page
router.get('/', function(req, res, next) {
  res.render('home', { title: 'ESN' });
});

// Show Login Page
router.get('/login', function(req, res, next) {
	res.render('login', { title: 'login ESN'});
});

// Logout to Return to Home Page
router.get('/signout', function(req, res, next) {
    res.redirect('/');
});

module.exports = router;
