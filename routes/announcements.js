var express = require('express');
var router = express.Router();
var loggedIn = require('../utils/loggedIn');
var announcementsController = require('../controllers/annoucementsController');

// Show Home Page
router.get('/', loggedIn.loggedIn, function (req, res, next) {
    announcementsController.getAnnouncementCount()
        .then((count) => {
            res.render('announcements',
                {
                    title: 'ESN',
                    user: req.user,
                    announcement_info: {
                        pageSize: 10,
                        // count: count
                        count: 2000
                    }
                });
        })
        .catch((err) => res.status(500).send({ err }));

});

module.exports = router;