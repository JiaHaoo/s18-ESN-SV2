var express = require('express');
var router = express.Router();
var loggedIn = require('../utils/loggedIn');
var Resource = require('../models/resource');

//create new resource
router.post('/resources', loggedIn.loggedIn, function (req, res, next) {
    let docs = {
        owner: req.user,
        name: req.body.name,
        details: req.body.details,
        location: {
            type: 'Point',
            coordinates: [
                parseFloat(req.body.longitude),
                parseFloat(req.body.latitude)
            ]
        }
    };
    //req.body do not have Object as prototype
    //https://github.com/nodejs/node/pull/6289
    if (Object.prototype.hasOwnProperty.call(req.body, 'unlimited')) {
        docs.unlimited = true;
    } else {
        docs.unlimited = false;
        docs.quantity = req.body.quantity;
        docs.remainingQuantity = req.body.quantity;
        docs.unit = req.body.unit;
    }
    console.log(docs);
    (new Resource(docs)).save()
        .then((resource) => res.status(201).send(resource))
        .catch((e) => {
            res.status(500).send(e)
        });
});


//claim a limited resource
//success only if
// required amount < remaining
router.post('/resources/:resourceId/claim', loggedIn.loggedIn, function (req, res, next) {
    Resource
        .findById(req.params.resourceId)
        .populate("claimers", ["user", "amount"])
        .then((resource) => {
            if (resource.remainingQuantity < req.body.amount) {
                //throw!
                throw "tried to claim amount (" + req.body.amount + ") more than remaining quantity (" + resource.remainingQuantity + ")";
            }

            resource.remainingQuantity -= req.body.amount;

            var claimer = resource.claimers.find((o) => o.user._id === req.user._id);
            if (claimer) {
                claimer.amount += req.body.amount;
            } else {
                resource.claimers.push({ user: req.user, amount: req.body.amount });
            }
            return resource.save();
        })
        .then(() => res.status(201).send())
        .catch((e) => res.status(500).send(e));
});


//get all resources. hopefully will not be too much
router.get('/resources', loggedIn.loggedIn, function (req, res, next) {
    Resource.find()
        .populate("owner", ["username", "displayname"])
        .populate("claimers.user", "username")
        .then((resources) => {
            res.status(200).json(resources);
        })
        .catch((e) => {
            res.status(500).send(e)
        });
});

module.exports = router;