/* istanbul ignore file */
var express = require('express');
var router = express.Router();
var loggedIn = require('../utils/loggedIn.js');
var roomController = require('../controllers/roomController');

router.get('/:room_id',
    loggedIn.loggedIn,
    function (req, res, next) {
        roomController.getRoomById(req.params.room_id)
            .then((room) => {
                var roomName = null;
                if (room.binary) {
                    for (user of room.users) {
                        if (user.username != req.user.username) {
                            roomName = user.username;
                            break;
                        }
                    }
                } else if (room.name) {
                    roomName = room.name;
                } else {
                    throw new Error('fail to find the room');
                }
                res.render('main', {
                    user: req.user,
                    isNewMember: req.query.newMember === 'true',
                    room: room,
                    name: roomName
                })
            })
            .catch((err) => {
                res.status(500).send(err);
            });
    }
);

module.exports = router;