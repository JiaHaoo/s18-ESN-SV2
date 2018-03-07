var express = require('express');

var User = require('../models/models.js').User;
var passport = require('passport');
var loggedIn = require('../utils/loggedIn.js').loggedIn;
var userController = require('../controllers/userController');
var validation = require('../utils/validations');

function broadcastUserList(io) {
    userController.GetUsernamesByOnline()
        .then((users_dict) => {
            io.emit('userlist_update', users_dict);
        })
}

function routerFromIO(io) {
    var router = express.Router();
    var id_name = {};

    io.on('connection', function (socket) {

        userController.updateOnline(socket.request.user.username, true)
            .then(() => broadcastUserList(io));

        socket.on('disconnect', function () {

            userController.updateOnline(socket.request.user.username, false)
                .then(() => {
                    broadcastUserList(io);
                })
                .catch((err) => {
                    res.status(400).send({ error: err });
                });
        });

    });






    // Get Main Page After Login
    router.get('/:username',
        loggedIn,
        function (req, res, next) {
            //todo: render a profile page
            res.render('main', { user: req.user, isNewMember: req.query.newMember === 'true' });
        }
    );

    // Show Users
    router.get('/', loggedIn, function (req, res, next) {
        var sorts = req.query.sort;
        if (!sorts) {
            // Specify in the sort parameter the field or fields to sort by 
            // and a value of 1 or -1 to specify an ascending or descending sort respectively.
            sorts = { online: -1, username: 1 };
        } else {
            var sortsList = sorts.split(',');
            sorts = {};
            for (var ele of sortsList) {
                var key = ele;
                var value = 1;
                if (ele[0] && (ele[0] === '+' || ele[0] === '-')) {
                    value = ele[0] === '+' ? 1 : -1;
                    key = key.substring(1);
                }
                if (key === 'username' || key === 'online') {
                    sorts[key] = value;
                } else {
                    return res.status(400).send({ 'name': 'IncorrectQueryValue', 'message': 'value of query parameter \'sort\' is incorrect' });
                }
            }
        }

        var offset = req.query.offset;
        if (offset && !offset.match(/^-{0,1}\d+$/) || offset.length == 0) {
            return res.status(400).send({ 'name': 'IncorrectQueryValue', 'message': 'value of query parameter \'offset\' is incorrect' });
        } else if (!offset) {
            offset = 0;
        } else {
            offset = parseInt(offset);
        }

        var count = req.query.count;
        if (count && !count.match(/^-{0,1}\d+$/) || count.length == 0) {
            return res.status(400).send({ 'name': 'IncorrectQueryValue', 'message': 'value of query parameter \'count\' is incorrect' });
        } else if (!count) {
            count = 25;
        } else {
            count = parseInt(count);
        }

        User.
            find({}).
            sort(sorts).
            skip(offset).
            limit(count).
            exec(function (err, alluser) {
                //  var onlines=[];
                //  var offlines=[];
                if (err) {
                    return res.status(400).send(err);
                }

                onlines = alluser.filter(function (user) {
                    return user.online === 'online'
                });
                offlines = alluser.filter(function (user) {
                    return user.online === 'offline'
                });
                onl_map = onlines.map(x => x.username);
                offl_map = offlines.map(x => x.username);
                //res.json(200, {online: onl_map, offline: offl_map});   ---> deprecated
                res.send({ online: onl_map, offline: offl_map });
            });
    });


    // Post Login Info
    router.post('/', function (req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.status(401).send(info); }
            req.logIn(user, function (err) {
                if (err) { return res.send(info); }
                // When the parameter is an Array or Object, Express responds with the JSON representation
                //here: login success!
                res.send({ 'redirect': 'v1/users/' + req.user.username });
            });
        })(req, res, next);
    });

    //put change status
    router.put('/change_status/:username', function(req, res, next) {
        
        var new_status=req.body.status;
        console.log(new_status);

        userController.updateStatus(req.user,req.body.status)
            .then(() => {
                broadcastUserList(io);
                res.status(201).send({});
            })
            .catch((err) => {
                res.status(400).send({ error: err });
            });
        //res.render('success');
    })


    // Put Register Info
    router.put('/:username', function (req, res, next) {
        userController.createUser(req.params.username, req.body.password)
            .then(() => res.status(201).send({}))
            .catch(() => req.status(403).send(err));
    });

    return router;
};

module.exports = {
    routerFromIO: routerFromIO
};
