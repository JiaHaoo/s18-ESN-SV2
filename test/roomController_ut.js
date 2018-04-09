var assert = require('assert');
var mongoose = require('mongoose');
var chaiAsPromised = require('chai-as-promised');
var chai = require('chai');
var expect = chai.expect;
chai.use(chaiAsPromised);
var Room = require('../models/room.js');
var User = require('../models/user.js');

/**
 * before any use case: connect to test mongoDB database
 * before and after each `it`: drop db
 */
describe('roomController', function () {
    var user1 = {
                    username: "Pascal"
                };
    var user2 = {
                    username: "George"
                };
    var user3 = {
                    username: "Lily"
                };
    var users = [];
    var testRooms = [{
                        _id: "000000000000000000000000",
                        name: "Public",
                        binary: false,
                        users: []
                    },
                    {
                        name: "room1",
                        binary: true,
                        users: []
                    },
                    {
                        name: "room2",
                        binary: true,
                        users: []
                    }];

    before(function (done) {
        mongoose.connect('mongodb://127.0.0.1:27017/ESNTest');
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connnection error'));
        db.once('open', function () {
            console.log('connection to test db success!');
            done();
        });
    });

    beforeEach((done) => {
        mongoose.connection.db.dropDatabase()
            .then(() => User.create([user1, user2, user3]))
            .then((got_users) => {
                users = got_users;
                testRooms[1].users = [users[0], users[1]];
                testRooms[2].users = [users[1], users[2]];
                done();
            });
    });

    after((done) => {
        mongoose.connection.db.dropDatabase()
            .then(() => mongoose.connection.close())
            .then(() => done());
    });

    var roomController = require('../controllers/roomController.js');

    it('should get existing room', function (done) {
        Room.create(testRooms)
        .then(() => roomController.getOrCreateBinaryRoom(users[0], users[1]))
        .then((room) => {
            assert.equal(room.name, testRooms[1].name, "getting existing room: doesn't match: " + room.name + " and " + testRooms[1].name);
            //assert.deepEqual(room.users, testRooms[1].users.map(user => user._id));
            done();
        });
    });

    it('should create room by users', function (done) {
        roomController.getOrCreateBinaryRoom(users[0], users[1])
        .then((room) => {
            console.log(room.users);
            assert.deepEqual(room.users.map(user => user._id), testRooms[1].users.map(user => user._id));
            done();
        });
    });

    it('should get existing public room', function (done) {
        Room.create(testRooms)
        .then(() => roomController.getPublicRoom())
        .then((room) => {
            assert.equal(room._id, testRooms[0]._id);
            done();
        });
    });

    it('should create public room', function (done) {
        roomController.getPublicRoom()
        .then((room) => {
            assert.equal(room._id, testRooms[0]._id);
            done();
        });
    });

    it('should get room by id', function (done) {
        Room.create(testRooms)
        .then(() => roomController.getRoomById("000000000000000000000000"))
        .then((room) => {
            assert.equal(room._id, testRooms[0]._id);
            done();
        });
    });

    it('should reject getting unexisting room', function () {
        return expect(roomController.getRoomById("000000000000000000000001")).to.be.rejectedWith('room id not exist');
    });

    it('should get room by id = public', function (done) {
        roomController.getRoomById('public')
        .then((room) => {
            assert.equal(room._id, testRooms[0]._id);
            done();
        });
    });


});
