var express = require('express');
var router = express.Router();
var loggedIn = require('../utils/loggedIn');
var usersController = require('../controllers/userController');

// show profile page
router.get('/:username/profile', loggedIn.loggedIn, function(req, res, next) {
    res.render('profile', { user: req.user });
})
module.exports = router;