var express = require('express');
var router = express.Router();
var loggedIn = require('../utils/loggedIn.js');

router.get('/', loggedIn.loggedIn, function (req, res, next) {
    res.render('emergency_message',
        { title: 'Edit Your Emergency Message',
        user: req.user});
    }
);

module.exports = router;