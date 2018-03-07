var express = require('express');
var router = express.Router();
var loggedIn = require('../utils/loggedIn');
var announcementsController = require('../controllers/annoucementsController');

// Show Home Page
router.get('/', loggedIn.loggedIn, function (req, res, next) {
    announcementsController
        .getAnnouncements(req.params.limit || 10, req.params.offset || 0)
        .then((arr) => res.json(arr))
        .catch((err) => res.status(500).json({ err: err }));
});

router.put('/', loggedIn.loggedIn, function (req, res, next) {
    if (!req.body.title) {
        return res.status(400).json({ err: "title is required" });
    }
    announcementsController
        .putAnnouncement(req.body.title, req.body.content, req.user)
        .then(() => res.status(201).send({}))
        .catch((err) => res.status(500).json({ err: err }));
});

module.exports = router;