var express = require('express');
var router = express.Router();
var User = require('../models/models.js').User;
var passport = require('passport');
var loggedIn = require('./loggedIn.js');

// get main page of user
// router.get(/([a-z0-9A-Z_])+-*([a-z0-9A-Z_])+/, 
//   loggedIn,
//   function(req, res, next) {
//     return res.render('main', {user: req.user});
//   }
// );
router.get('/:username', 
  loggedIn, 
  function(req, res, next) {
    if(req.query.newMember === '1') {
      // new memeber
      res.render('main', {user: req.user});
    } else {
      res.render('main', {user: req.user});
    }
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
      // When the parameter is an Array or Object, Express responds with the JSON representation
      res.send({'redirect': 'v1/users/' + req.user.username});
    });
  })(req, res, next);
});


// Put Register Info
// router.put(/([a-z0-9A-Z_])+-*([a-z0-9A-Z_])+/, function(req, res, next) {
// 	User.register(new User({ username :  req.path.substring(1)}), req.body.password, function(err, user) {
//         if (err) {
//             res.send({'redirect': '/login'});
//         }
//   });
// });

router.put('/:username', function(req, res, next) {
  if (!checkAvailability(req.params.username)) {
    return res.status(403).send({name: 'InvalidUsernameError', message: 'not a valid username'});
  }
  User.register(new User({ username:  req.params.username}), req.body.password, function(err, user) {
    if (err) {
      return res.status(403).send(err);
    }
    return res.send({});
  });
});

function checkAvailability(str) {
  return true;
}

module.exports = router;
