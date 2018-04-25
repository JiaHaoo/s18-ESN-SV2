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
    userController.GetAllUsernamesByOnline()
        .then((users_dict) => {
            io.emit('all_userlist_update', users_dict);
        })
}

module.exports = function (io) {
    var router = express.Router();
    var id_name = {};

    /* istanbul ignore start */
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
    /* istanbul ignore end */

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

        var query = req.query.query;
        const showAllUserStatus = req.user.privilege_level === 'Administrator';
        userController.GetUsernamesByOnline(sorts, offset, count, query, showAllUserStatus)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                res.status(400).send({ error: err });
            });
    });

    router.get('/:username', function (req, res, next) {
        userController.findUserByUsername(req.params.username)
            .then((user) => {
                res.send(user);
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
            if (user.account_status === 'Inactive') {
                return res.status(403).send({ name: "InactiveUserError", message: "inactive user cannot log in" });
            }
            req.logIn(user, function (err) {
                if (err) { return res.send(info); }
                //here: login success!
                res.send({ 'redirect': '/rooms/public' });
            });
        })(req, res, next);
    });

    //put change status
    router.put('/:username', function (req, res, next) {
        userController.findUserByUsername(req.params.username)
            .then((user) => {
                userController.updateStatus(user, req.body)
                    .then((new_user) => {
                        console.log(new_user);
                        broadcastUserList(io);// only for active users
                        // force to log out
                        // send a message to user
                        if (new_user.account_status === "Inactive") {
                            //inactive actions:
                            // - close socket (kick them out of the socket.io room)
                            // - remove session
                            // - refuse to login again
                            io.to(new_user.username).emit('show_logout_message', "you have been forced to log out");

                            var users = io.rooms[new_user.username];

                            for (var i = 0; i < users.length; i++) {
                                io.sockets.socket(users[i]).disconnect();
                            }

                        }
                        res.send({});
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(400).send({ error: err });
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(400).send({ error: err });
            });

    });


    // Put Register Info
    router.post('/:username', function (req, res, next) {
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
