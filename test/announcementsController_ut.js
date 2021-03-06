var assert = require('assert');
var mongoose = require('mongoose');
var Announcement = require('../models/announcement.js');

/**
 * before any use case: connect to test mongoDB db
 * before each `it`: drop database
 */
describe('announcement_api', function () {
    var testAnnouncements = [{ title: "a1", timestamp: "2018-03-07T06:56:16.590Z", content: "aaa" },
    { title: "aaa", timestamp: "2018-03-07T06:56:34.535Z", content: "bbb" },
    { title: "a3", timestamp: "2018-03-07T07:04:36.068Z", content: "ccc" }];
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
            .then(() => Announcement.ensureIndexes())
            .then(done);
    });

    after((done) => {
        mongoose.connection.db.dropDatabase()
            .then(() => mongoose.connection.close())
            .then(() => done());

    });

    var announcementsController = require('../controllers/announcementsController.js');

    it('should get the number of announcements', function (done) {
        Announcement.create(testAnnouncements)
            .then(announcementsController.getAnnouncementCount)
            .then((num) => {
                assert.equal(testAnnouncements.length, num, 'get count does not equal to inserted count');
                done();
            });
    });


    it('should get all of announcements', function (done) {

        Announcement.create(testAnnouncements)
            .then(() => announcementsController.getAnnouncements(3, 0, null))
            .then((arr) => {
                const gotTitles = arr.map((a) => a.title).sort();
                const shouldBeTitles = testAnnouncements.map((a) => a.title).sort();
                assert.deepEqual(gotTitles, shouldBeTitles, "did not get all titles, got" + gotTitles + " , should be " + shouldBeTitles);
                done();
            });
    });

    it('should put an announcement into database', function (done) {
        var newAnnouncement = [{ title: "a4", timestamp: "2018-03-08T06:56:34.535Z" }];
        Announcement.create(testAnnouncements)
            .then(() => Announcement.create(newAnnouncement))
            .then(announcementsController.latestAnnouncement)
            .then((announcement) => {
                assert.deepEqual("a4", announcement.title, 'did not put into db');
                done();
            });

    });

    it('should get the latest announcements', function (done) {
        Announcement.create(testAnnouncements)
            .then(announcementsController.latestAnnouncement)
            .then((announcement) => {
                assert.deepEqual("a3", announcement.title, 'not get the latest' + announcement.title);
                done();
            });
    });

    it('should get 2 announcements', function (done) {
        Announcement.create(testAnnouncements)
            .then(() => announcementsController.getAnnouncements(2, 1))
            .then((arr) => {
                const gotTitles = arr.map((a) => a.title).sort();
                const shouldBeTitles = ['a1', 'aaa'];
                assert.deepEqual(shouldBeTitles, gotTitles, "not get 2 announcements" + gotTitles);
                done();
            });
    });

    it('should get announcement satisfying query', function (done) {
        Announcement.create(testAnnouncements)
            .then(() => announcementsController.getAnnouncements(10, 0, "aaa"))
            .then((announcements) => {
                //console.log(announcements);
                assert.equal(2, announcements.length, 'not get satisfying query in room 1');
                done();
            });
    });

    it('should not get announcementss unsatisfying query', function (done) {
        Announcement.create(testAnnouncements)
            .then(() => announcementsController.getAnnouncements(10, 0, "aaab"))
            .then((announcements) => {
                //console.log(announcements);
                assert.equal(0, announcements.length, 'get satisfying query in room 1');
                done();
            });
    });

    it('should get announcement satisfying query only for title', function (done) {
        Announcement.create(testAnnouncements)
            .then(() => announcementsController.getAnnouncements(10, 0, "a1"))
            .then((announcements) => {
                //console.log(announcements);
                assert.equal(1, announcements.length, 'not get satisfying query in room 1');
                done();
            });
    });

    it('should get announcement satisfying query only for content', function (done) {
        Announcement.create(testAnnouncements)
            .then(() => announcementsController.getAnnouncements(10, 0, "bbb"))
            .then((announcements) => {
                //console.log(announcements);
                assert.equal(1, announcements.length, 'not get satisfying query in room 1');
                done();
            });
    });

});
