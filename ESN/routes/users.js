var express = require('express');
var router = express.Router();
var User = require('../models/models.js').User;
var passport = require('passport');


/* GET users listing. */
router.get(/([a-z0-9A-Z_])+-*([a-z0-9A-Z_])+/, function(req, res, next) {
  res.send('respond with a resource');
});

// router.get(/a/, function(req, res, next) {

// });

// Post Login Info
router.post('/', passport.authenticate('local'), function(req, res) {
	res.send(req.user.username);
	//res.redirect('/v1/users/' + req.user.username);
});

router.put(/([a-z0-9A-Z_])+-*([a-z0-9A-Z_])+/, function(req, res, next) {
	User.register(new User({ username :  req.path.substring(1)}), req.body.password, function(err, user) {
        if (err) {
            return res.render('login', { title : 'login ESN' });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/v1/users/' + user.username);
        });
    });
});

module.exports = router;
