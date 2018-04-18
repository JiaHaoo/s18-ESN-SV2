var assert = require('assert');
var mongoose = require('mongoose');
var Guide = require('../models/guide.js');

/**
 * before any use case: connect to test mongoDB db
 * before each `it`: drop database
 */
describe('guide_api', function () {
    var testGuides = [{ title: "guide1", timestamp: "2018-03-07", content: "aaa", tags: ["tag1"] },
    { title: "guide2", timestamp: "2018-03-07", content: "bbb", tags: ["tag2", "tag1"] },
    { title: "guide3", timestamp: "2018-03-07", content: "ccc", tags: ["tag3", "tag2"] }];
    before(function (done) {
        mongoose.connect('mongodb://127.0.0.1:27017/ESNTest');
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error'));
        db.once('open', function () {
            console.log('We are connected to test database!');
            done();
        });
    });

    beforeEach((done) => {
        mongoose.connection.db.dropDatabase()
            .then(() => Guide.ensureIndexes())
            .then(done);
    });

    after((done) => {
        mongoose.connection.db.dropDatabase()
            .then(() => mongoose.connection.close())
            .then(() => done());

    });

    var guideController = require('../controllers/guideController.js');

    it('should get the guides and count', function (done) {
        guideController.getGuides(0, 10)
            .then((result) => {
                assert.equal(0, result.count, 'get count does not equal to inserted count');
                done();
            });
    });


    it('should get all of guides', function (done) {
        Guide.create(testGuides)
            .then(() => guideController.getGuideCountAndTags())
            .then((result) => {
                assert.equal(testGuides.length, result.count, 'get count does not equal to inserted count');
                done();
            });
    });
});
