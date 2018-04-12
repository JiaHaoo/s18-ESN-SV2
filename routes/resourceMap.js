var express = require('express');
var router = express.Router();
var loggedIn = require('../utils/loggedIn');

// Show Home Page
router.get('/', loggedIn.loggedIn, function (req, res, next) {
    res.render('resourceMap',
        {
            title: 'ESN',
            user: req.user,
        });

});

module.exports = router;