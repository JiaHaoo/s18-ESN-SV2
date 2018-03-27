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
            //optimization: check binary or not first, then populate
            // .then((room) => {
            //     return new Promise((resolve, reject) => {
            //         if (room.binary) {
            //             for (user of room.users) {
            //                 if (user.username != req.user.username) {
            //                     //the other guy!
            //                     return resolve([room, user.displayname]);
            //                 }
            //             }
            //             //not found???
            //             reject('user not found');
            //         } else {
            //             //room is not binary
            //             resolve([room, room.name]);
            //         }
            //     })
            // })
            // .then((info) => {
            //     room = info[0];
            //     name = info[1];
            //     res.render('main', {
            //         user: req.user,
            //         isNewMember: req.query.newMember === 'true',
            //         room: room,
            //         name: name
            //     });
            // })
            // .catch((err) => res.status(500).send(err));
    }
);

module.exports = router;