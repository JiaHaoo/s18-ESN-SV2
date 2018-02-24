//to post a message
var express = require('express');
var mongoose = require('mongoose');
var Message = require('../models/models.js').Message;
var loggedIn = require('./loggedIn.js').loggedIn;


module.exports = function (io) {
    var router = express.Router();

    router.post('/:room_id/messages', function (req, res) {

        //save message to DB
        var message = new Message();
        message.sender = req.user;
        message.senderStatus = req.user.status;
        message.content = req.body.content;
        message.timestamp = new Date();
        message.room = mongoose.Types.ObjectId(req.params.room_id);
        message.save(function (err) {
            if (err) {
                console.log('Error in Saving message: ' + err);
                //for now just lost this message
                // throw err;
            }
        });
        message.populate({ path: 'sender', select: 'username' })
        //console.log(message);
        //emit a socket event

        io.emit('show_messages', [message]);
        //console.log(req.body);
        //console.log(req.user.username);
        res.status(201).json({});


    });


    router.get('/:room_id/messages', function (req, res) {

        var timestamp = req.query.sort;
        console.log(timestamp);
        var limit;
        if (req.query.limit !== undefined) {
            limit = req.query.count;
        }
        else limit = 10;

        Message
            .find({})
            .sort(timestamp)
            .limit(limit)
            .populate({ path: 'sender', select: 'username' })
            .exec(function (err, msgs) {
                if (err) {
                    console.log('Error in getting history: ' + err);
                    //return empty history for now
                }

                console.log(msgs)
               // msgs.reverse(); //reorder msgs in time ascending order
                res.send(msgs);
            });

    });
    return router;
};
// GET /v1/rooms/0/msgs
