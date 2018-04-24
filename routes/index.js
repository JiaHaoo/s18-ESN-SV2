/* istanbul ignore file */
var express = require('express');
var router = express.Router();
var notLoggedIn = require('../utils/loggedIn.js').notLoggedIn;

// Show Home Page
router.get('/', notLoggedIn, function (req, res, next) {
  res.render('home', { title: 'ESN' });
});

// Show Login Page
router.get('/login', notLoggedIn, function (req, res, next) {
  res.render('login', { title: 'login ESN' });
});

// Logout to Return to Home Page
router.get('/signout', function (req, res, next) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
