var express = require('express');
var loggedIn = require('../utils/loggedIn.js').loggedIn;
var guideController = require('../controllers/guideController.js');
var validation = require('../utils/validations');

module.exports = function () {
    var router = express.Router();

    router.get('/', function (req, res, next) {
        try {
            var offset = validation.expectNonNegative(req.query.offset, 0);
            var limit = validation.expectNonNegative(req.query.limit, 25);
        } catch (err) {
            return res.status(400).send({ 'name': 'IncorrectQueryValue', 'message': 'value of query parameter is incorrect' });
        }

        var query = req.query.query;
        var tags = req.query.tags;
        if (tags) {
            tags = tags.split(',');
        }
        guideController.getGuides(offset, limit, query, tags)
            .then((result) => {
                res.send({
                    guides: result.guides,
                    count: result.count
                });
            })
            .catch((err) => {
                res.status(400).send({ error: err });
            });
    });

    router.post('/', function (req, res, next) {
        guideController.createGuide(req.user, req.body.title, req.body.content, req.body.tags)
            .then(() => {
                res.status(201).send({});
            })
            .catch((err) => {
                res.status(403).send(err);
            });
    });

    return router;
}