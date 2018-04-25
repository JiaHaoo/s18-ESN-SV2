var express = require('express');
var router = express.Router();
var loggedIn = require('../utils/loggedIn');
var announcementsController = require('../controllers/announcementsController');
var validation = require('../utils/validations');


module.exports = function (io) {

    /* istanbul ignore start */
    io.on('connection', function (socket) /* istanbul ignore next */ {
        announcementsController.latestAnnouncement()
            .then((announcement) => {
                if (!(announcement === null)) {
                    socket.emit('show_announcement', announcement);
                }
            })
    });
    /* istanbul ignore end */

    // get array of announcements
    router.get('/', loggedIn.loggedIn, loggedIn.PrivilegeLevel, function (req, res, next) {
        announcementsController
            .getAnnouncements(
                parseInt(req.query.limit) || 10,
                parseInt(req.query.offset) || 0,
                req.query.query)
            .then((arr) => {
                res.json({ announcements: arr })
            });
    });

    router.post('/', loggedIn.loggedIn, loggedIn.PrivilegeLevel, function (req, res, next) {
        if (!validation.AnnouncementTitleIsGood(req.body.title)) {
            return res.status(400).json({ err: "title is required and less than 81 chars" });
        }
        return announcementsController
            .putAnnouncement(req.body.title, req.body.content, req.user)
            .then((announcement) => new Promise((resolve, reject) => {
                io.emit('show_announcement', announcement);
                //console.log(announcement);
                resolve();
            }))
            .then(() => res.status(201).send({}));

    });

    return router;
}