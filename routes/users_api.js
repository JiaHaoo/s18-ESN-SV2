var express = require('express');
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

module.exports = function(io) {
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

    // Show Users
    router.get('/', function (req, res, next) {
        var sorts = req.query.sort;
        if (sorts) {
            sorts = sorts.replace(',', ' ');
        }

        try {
            var offset = validation.expectNonNegative(req.query.offset, 0);
            var count = validation.expectNonNegative(req.query.count, 25);
        } catch (err) {
            return res.status(400).send({ 'name': 'IncorrectQueryValue', 'message': 'value of query parameter is incorrect' });
        }
        
        userController.GetUsernamesByOnline(sorts, offset, count)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(400).send({ error: err });
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
                res.send({ 'redirect': '/rooms/public' });
            });
        })(req, res, next);
    });

    //put change status
    router.put('/:username', function (req, res, next) {
        userController.updateStatus(req.user, req.body.status)
            .then(() => {
                broadcastUserList(io);
                res.send({});
            })
            .catch((err) => {
                res.status(400).send({ error: err });
            });
    })


    // Put Register Info
    router.post('/:username', function (req, res, next) {
        console.log(req.body.username);
        console.log(req.body.password);
        userController.createUser(req.body.username, req.body.password)
            .then(() => {
                res.status(201).send({});
            })
            .catch((err) => {
                res.status(403).send(err);
            });
    });

    return router;
};
