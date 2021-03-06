/* istanbul ignore file */

var express = require('express');
var router = express.Router();
var loggedIn = require('../utils/loggedIn');
var announcementsController = require('../controllers/announcementsController');

// Show Home Page
router.get('/', 
    loggedIn.loggedIn, 
    loggedIn.PrivilegeLevel, 
    function (req, res, next) {
    announcementsController.getAnnouncementCount()
        .then((count) => {
            res.render('announcements',
                {
                    title: 'ESN',
                    user: req.user,
                    announcement_info: {
                        pageSize: 10,
                        count: count
                    }
                });
        })
        .catch((err) => res.status(500).send({ err }));

});

module.exports = router;