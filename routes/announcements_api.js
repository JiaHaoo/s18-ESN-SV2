var express = require('express');
var router = express.Router();
var loggedIn = require('../utils/loggedIn');
var announcementsController = require('../controllers/announcementsController');
var validation = require('../utils/validations');

// get array of announcements
router.get('/', loggedIn.loggedIn, function (req, res, next) {
    announcementsController
        .getAnnouncements(req.params.limit || 10, req.params.offset || 0)
        .then((arr) => res.json({ announcements: arr }))
        .catch((err) => res.status(500).json({ err: err }));
});

router.put('/', loggedIn.loggedIn, function (req, res, next) {
    if (!validation.AnnouncementTitleIsGood(req.body.title)) {
        return res.status(400).json({ err: "title is required and less than 81 chars" });

    }
    announcementsController
        .putAnnouncement(req.body.title, req.body.content, req.user)
        .then(() => res.status(201).send({}))
        .catch((err) => res.status(500).json({ err: err }));
});

module.exports = router;