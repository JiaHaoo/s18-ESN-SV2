var express = require('express');
var router = express.Router();
var User = require('../models/models.js').User;
var passport = require('passport');
var loggedIn = require('./loggedIn.js');

// get main page of user
router.get(/([a-z0-9A-Z_])+-*([a-z0-9A-Z_])+/, 
  loggedIn,
  function(req, res, next) {
    return res.render('main', {user: req.user});
  }
);

/* GET users listing. */
router.get('/', loggedIn, function(req, res, next) {
    User.
    find({}).
    sort('username').
    exec(function(err,alluser){
        //  var onlines=[];
        //  var offlines=[];

        onlines=alluser.filter(function(user){
            return user.status === 'online'
        });
        offlines=alluser.filter(function(user){
            return user.status === 'offline'
        });
        onl_map = onlines.map(x => x.username);
        offl_map = offlines.map(x => x.username);
        res.json(200, {online: onl_map, offline: offl_map});
    });
});

// Post Login Info
router.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.status(401).send(info); }
    req.logIn(user, function(err) {
      if (err) { return res.send(info); }
      return res.redirect(303, '/v1/users/' + req.user.username);
    });
  })(req, res, next);
});


// Put Register Info
router.put(/([a-z0-9A-Z_])+-*([a-z0-9A-Z_])+/, function(req, res, next) {
	User.register(new User({ username :  req.path.substring(1)}), req.body.password, function(err, user) {
        if (err) {
            return res.render('login', { title : 'login ESN' });
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect(303, '/v1/users/' + user.username);
        });
    });
});

module.exports = router;
