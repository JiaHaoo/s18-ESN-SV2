//to post a message
var express = require('express');
var loggedIn = require('../utils/loggedIn.js').loggedIn;
var messageController = require('../controllers/messageController');

module.exports = function (io) {

    io.on('connection', function (socket) {
        //put socket into all rooms it belongs to
        socket.request.user
            .rooms
            .forEach(room => {
                socket.join(room.id);
            });
    });

    var router = express.Router();

    router.post('/:room_id/messages', loggedIn, function (req, res) {

        messageController.CreateMessageAndSave(req.user, req.body.content, req.params.room_id)
            .then((message) => {
                //emit a socket event
                io.to(req.params.room_id).emit('show_messages', [message]);
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
            req.query.offset || 0)
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
