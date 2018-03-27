var assert = require('assert');
var mongoose = require('mongoose');
var models = require('../models/models');

/**
 * before any use case: connect to test mongoDB db
 * before each `it`: drop database
 */
describe('message Controller', function () {
    var room_id1 = "000000000000000000000000";
    var room_id2 = "111111111111111111111111";
    var testMessages = [{ sender: mongoose.Types.ObjectId("000000000000"), content: "aaaaa", timestamp: "2018-03-07T06:56:16.590Z", room: mongoose.Types.ObjectId(room_id1) },
    { sender: mongoose.Types.ObjectId("111111111111"), content: "bbbbbb abab", timestamp: "2018-03-07T06:56:34.535Z", room: mongoose.Types.ObjectId(room_id1) },
    { sender: mongoose.Types.ObjectId("222222222222"), content: "cccccc", timestamp: "2018-03-07T07:04:36.068Z", room: mongoose.Types.ObjectId(room_id1) }];
    var testMessage2 = [{
        sender: mongoose.Types.ObjectId("000000000000"),
        content: "aaaaa",
        timestamp: "2018-03-07T06:56:16.590Z",
        room: mongoose.Types.ObjectId(room_id2)
    }]


    before(function (done) {
        mongoose.connect('mongodb://localhost/ESNTest');
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error'));
        db.once('open', function () {
            console.log('We are connected to test database!');
            done();
        });
    });

    beforeEach((done) => {
        mongoose.connection.db.dropDatabase()
            .then(() => models.Message.ensureIndexes())
            .then(() => models.Announcement.ensureIndexes())
            .then(() => models.User.ensureIndexes())
            .then(() => models.Room.ensureIndexes())
            .then(done);
    });

    after((done) => {
        mongoose.connection.db.dropDatabase()
            .then(() => mongoose.connection.close())
            .then(done);

    });

    var messageController = require('../controllers/messageController.js');


    it('should get messages in database', function (done) {
        models.Message.create(testMessages)
            .then(() => messageController.GetMessages(room_id1, "+timestamp", 3, 0))
            .then((message) => {
                assert.equal(3, message.length, 'did not get correct message' + message);
                done();
            });
    });
    it('should get messages in a right order', function (done) {
        models.Message.create(testMessages)
            .then(() => messageController.GetMessages(room_id1, "timestamp", 3, 0))
            .then((message) => {
                //console.log(message);
                const gotContent = message.map((a) => a.content);
                const shouldBeContent = ['aaaaa', 'bbbbbb abab', 'cccccc'];
                assert.deepEqual(shouldBeContent, gotContent, 'not in correct order');
                done();
            });
    });


    it('should get messages and skip 1', function (done) {
        models.Message.create(testMessages)
            .then(() => messageController.GetMessages(room_id1, "timestamp", 3, 1))
            .then((message) => {
                //console.log(message);
                const gotContent = message.map((a) => a.content);
                const shouldBeContent = ['bbbbbb abab', 'cccccc'];
                assert.deepEqual(shouldBeContent, gotContent, 'not in correct order');
                done();
            });
    });
    it('should get messages and skip 1 and in desc order', function (done) {
        models.Message.create(testMessages)
            .then(() => messageController.GetMessages(room_id1, "-timestamp", 3, 1))
            .then((message) => {
                //console.log(message);
                const gotContent = message.map((a) => a.content);
                const shouldBeContent = ['bbbbbb abab', 'aaaaa'];
                assert.deepEqual(shouldBeContent, gotContent, 'not in correct order');
                done();
            });
    });

    it('should get messages in room1', function (done) {
        models.Message.create(testMessages)
            .then(() => models.Message.create(testMessage2))
            .then(() => messageController.GetMessages(room_id1, "-timestamp", 10, 0))
            .then((message) => {
                //console.log(message);

                assert.equal(3, message.length, 'not get message only in room 1');
                done();
            });
    });

    it('should get messages in room2', function (done) {
        models.Message.create(testMessages)
            .then(() => models.Message.create(testMessage2))
            .then(() => messageController.GetMessages(room_id2, "-timestamp", 10, 0))
            .then((message) => {
                //console.log(message);

                assert.equal(1, message.length, 'not get message only in room 1');
                done();
            });
    });

    it('should get create a message and store it in db', function (done) {
        models.Message.create(testMessages)
            .then(() => messageController.CreateMessageAndSave(mongoose.Types.ObjectId("000000000000"), "hi", room_id1))
            .then(() => messageController.GetMessages(room_id1, "timestamp", 10, 0))
            .then((message) => {
                //console.log(message);
                const gotContent = message.map((a) => a.content)[message.length - 1];
                const shouldBeContent = 'hi';
                assert.deepEqual(shouldBeContent, gotContent, 'not in correct order' + gotContent);
                done();
            });
    });

    it('should get messages satisfying query', function (done) {
        models.Message.create(testMessages)
            .then(() => models.Message.create(testMessage2))
            .then(() => messageController.GetMessages(10, 0, "aaa"))
            .then((message) => {
                //console.log(message);
                assert.equal(1, message.length, 'not get satisfying announcement');
                done();
            });
    });

    it('should not get messages unsatisfying query', function (done) {
        models.Message.create(testMessages)
            .then(() => models.Message.create(testMessage2))
            .then(() => messageController.GetMessages(10, 0, "aaab"))
            .then((message) => {
                //console.log(message);
                assert.equal(0, message.length, 'get satisfying announcement');
                done();
            });
    });

});