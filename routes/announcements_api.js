var express = require('express');
var router = express.Router();
var loggedIn = require('../utils/loggedIn');
var announcementsController = require('../controllers/announcementsController');
var validation = require('../utils/validations');


module.exports = function (io) {

    io.on('connection', function (socket) {
        announcementsController.latestAnnouncement()
            .then((announcement)=> socket.emit('show_announcement', announcement));
    });


// get array of announcements
    router.get('/', loggedIn.loggedIn, function (req, res, next) {
        announcementsController
            .getAnnouncements(req.params.limit || 10, req.params.offset || 0)
            .then((arr) => res.json({announcements: arr}))
    .catch((err) => res.status(500).json({err: err}));
    });

    router.put('/', loggedIn.loggedIn, function (req, res, next) {
        if (!validation.AnnouncementTitleIsGood(req.body.title)) {
            return res.status(400).json({err: "title is required and less than 81 chars"});

        }
        return announcementsController
            .putAnnouncement(req.body.title, req.body.content, req.user)
            .then((announcement) => new Promise((resolve, reject) => {
                io.emit('show_announcement', announcement);
                //console.log(announcement);
                resolve();
            }))
            .then(() => res.status(201).send({}))
            .catch((err) => res.status(500).json({err: err}));

    });

    return router;
}