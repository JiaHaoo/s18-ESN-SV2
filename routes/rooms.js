var express = require('express');
var router = express.Router();
var loggedIn = require('../utils/loggedIn.js');
var roomController = require('../controllers/roomController');

// Get Main Page After Login
router.get('/:room_id',
    loggedIn.loggedIn,
    function (req, res, next) {
        roomController.getRoomById(req.params.room_id)
            //optimization: check binary or not first, then populate
            .then((room) => {
                return new Promise((resolve, reject) => {
                    if (room.binary) {
                        room.populate({ path: 'users', select: ['username', 'displayname'] },
                            (err, room) => {
                                //change name to the other user's username
                                for (user of room.users) {
                                    if (user.username != req.user.username) {
                                        //the other guy!
                                        return resolve([room, user.displayname]);
                                    }
                                }
                                //not found???
                                reject('user not found');
                            });
                    } else {
                        //room is not binary
                        resolve([room, room.name]);
                    }
                })
            })
            .then((info) => {
                room = info[0];
                name = info[1];
                res.render('main', {
                    user: req.user,
                    isNewMember: req.query.newMember === 'true',
                    room: room,
                    name: name
                });
            })
            .catch((err) => res.status(500).send(err));
    }
)

module.exports = router;