/* istanbul ignore file */
var express = require('express');
var router = express.Router();
var loggedIn = require('../utils/loggedIn');
var userController = require('../controllers/userController');
var roomController = require('../controllers/roomController');

// show user list
router.get('/', loggedIn.loggedIn, function (req, res, next) {
    res.render('userlist', { user: req.user });
});

// show profile page
router.get('/:username', loggedIn.loggedIn, function (req, res, next) {
    res.render('profile', { user: req.user });
});

router.get('/:username/chat', loggedIn.loggedIn, function (req, res, next) {
    // check room(req.user.username + username) exists or not?
    userController.findUserByUsername(req.params.username)
        .then((user) => {
            if (!user) {
                res.status(404).send("User not found!");
                return;
            } else {
                roomController.getOrCreateBinaryRoom(user, req.user)
                    .then((room) => {
                        res.redirect(301, '/rooms/' + room.id);
                    });
            }
        });
});


module.exports = router;