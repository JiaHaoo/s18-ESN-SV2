//to post a message
var express = require('express');
var loggedIn = require('../utils/loggedIn.js').loggedIn;
var messageController = require('../controllers/messageController');
var roomController = require('../controllers/roomController');

module.exports = function (io) {

    /* istanbul ignore start */
    io.on('connection', function (socket) {
        //put socket into all rooms it belongs to
        socket.join(socket.request.user.username);
    });
    /* istanbul ignore end */

    var router = express.Router();

    router.post('/:room_id/messages', loggedIn, function (req, res) {

        var promiseMessage = messageController.CreateMessageAndSave(req.user, req.body.content, req.params.room_id);
        var promiseRoom = roomController.getRoomById(req.params.room_id);
        Promise.all([promiseMessage, promiseRoom])
            .then((values) => {
                var message = values[0];
                var room = values[1];
                for (user of room.users) {
                    //console.log(user.username);
                    io.to(user.username).emit('show_messages', [message]);
                }
                res.status(201).json({});
            })
            .catch((err) => {
                res.status(500).send({ error: err });
            });

    });


    router.get('/:room_id/messages', loggedIn, function (req, res) {


        messageController.GetMessages(
            req.params.room_id,
            req.query.sort,
            req.query.count || 10,
            req.query.offset || 0,
            req.query.query)

            .then((msgs) => {
                res.send(msgs);
            })
            .catch((err) => {
                res.status(500).send({ error: err });
            });
    });
    return router;
};
// GET /v1/rooms/0/msgs
