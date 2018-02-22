var express = require('express');

var User = require('../models/models.js').User;
var passport = require('passport');
var loggedIn = require('./loggedIn.js');


function checkAvailability(str) {
  return true;
}

function broadcastUserList(io) {
    User.
    find({}).
    sort('username').
    exec(function(err,alluser){
        //  var onlines=[];
        //  var offlines=[];

        var onlines=alluser.filter(function(user){
            return user.status === 'online'
        });
        var offlines=alluser.filter(function(user){
            return user.status === 'offline'
        });
        var onl_map = onlines.map(x => x.username);
        var offl_map = offlines.map(x => x.username);
        io.emit('userlist_update',{online:onl_map,offline:offl_map});
    });
}

module.exports = function (io) {
    var router = express.Router();
// get main page of user

    router.get('/:username',
        loggedIn,
        function(req, res, next) {
            User.update({username: req.user.username}, {status: 'online'}, {multi: false}, function (err, docs) {
                if (err) console.log(err);
            });
            if(req.query.newMember === 'true') {
                // new memeber
                res.render('main', {user: req.user, isNewMember: 1});
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
                //here: login success!
                User.update({username:req.user.username},{status:'online'},{multi: false}, function(err, docs){
                    // if(err) console.log(err);
                    if(err) {
                      return res.status(503).send(err);
                    }
                    broadcastUserList(io);
                    res.send({'redirect': 'v1/users/' + req.user.username});
                });  
            });
        })(req, res, next);
    });


// Put Register Info
    router.put('/:username', function(req, res, next) {
        if (!checkAvailability(req.params.username)) {
            return res.status(403).send({name: 'InvalidUsernameError', message: 'not a valid username'});
        }
        User.register(new User({
            username: req.path.substring(1),
            displayname: req.path.substring(1),
            status: 'online',
            rooms: ['000000000000']
        }), req.body.password, function(err, user) {
            if (err) {
                //return res.render('login', { title : 'login ESN' });
                return res.status(403).send(err);
            }
            return res.send({});
        });
    });

    return router;
};
