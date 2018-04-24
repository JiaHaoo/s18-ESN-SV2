/* istanbul ignore file */

var express = require('express');
var router = express.Router();
var loggedIn = require('../utils/loggedIn');
var guideController = require('../controllers/guideController');

// Show Home Page
router.get('/', loggedIn.loggedIn, function (req, res, next) {
    //should return guide page
    guideController.getGuideCountAndTags()
        .then((result) => {
            console.log(result.tags);
            res.render('guides', {
                user: req.user,
                guide_info: {
                    pageSize: 10,
                    count: result.count,
                    tags: result.tags
                }
            });
        });

});

module.exports = router;