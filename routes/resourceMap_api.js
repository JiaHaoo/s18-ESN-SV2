var express = require('express');
var router = express.Router();
var loggedIn = require('../utils/loggedIn');
var Resource = require('../models/resource');
var ResourceMapController = require('../controllers/resourceMapController');

//create new resource
router.post('/resources', loggedIn.loggedIn, function (req, res, next) {
    ResourceMapController.createResource(req.user, req.body)
        .then((resource) => res.status(201).send(resource))
        .catch((e) => {
            res.status(500).send(e);
        });
});


//claim a limited resource
//success only if
// required amount < remaining
router.post('/resources/:resourceId/claim', loggedIn.loggedIn, function (req, res, next) {
    ResourceMapController.claimResource(req.user, req.params.resourceId, req.body.amount)
        .then(() => res.status(201).send())
        .catch((e) => res.status(500).send(e));
});


//get all resources. hopefully will not be too much
router.get('/resources', loggedIn.loggedIn, function (req, res, next) {
    ResourceMapController.getResources()
        .then((resources) => {
            res.status(200).json(resources);
        })
        .catch((e) => {
            res.status(500).send(e)
        });
});

module.exports = router;