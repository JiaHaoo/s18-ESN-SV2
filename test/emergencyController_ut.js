var assert = require('assert');
var mongoose = require('mongoose');
var Announcement = require('../models/emergency.js');
var User = require('../models/user.js');
var Emergemcy = require('../models/emergency.js');

describe('emergency_controller', function () {
    var newuser=[{username:'apple', password:'apple123', online:true, status:'ok', emergency_contact:"banana", emergency_message:"hi"},
        {username:'banana', password:'banana123', online:false, status:'help',emergency_contact:"apple", emergency_message:"hello"},
        {username:'orange', password:'orange123', online:true, status:'emergency'}
    ];
    var testEmergency = [{ sender: "", timestamp: "2018-03-07T06:56:16.590Z", message: "aaa",receiver: "", ifShown: 'true' },
        { sender: "", timestamp: "2018-03-07T06:56:34.535Z", message: "bbb",receiver: "", ifShown: 'true' },
        { sender: "", timestamp: "2018-03-07T07:04:36.068Z", message: "ccc",receiver: "",ifShown: 'true' }];
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
            .then(() => done());
    });

    after((done) => {
        mongoose.connection.db.dropDatabase()
            .then(() => mongoose.connection.close())
            .then(() => done());

    });

    var emergencyController = require('../controllers/emergencyController.js');
    it('should get emergencyContact for users', function (done) {
        User.create(newuser)
            .then(()=>{
                return emergencyController.getEmergencyContact(newuser[0]);
            })
            .then((user)=>{
                   // console.log(user);
                    assert.strictEqual(user[0].username, newuser[0].emergency_contact, "did not get the right emergency contact");
                    // assert.strictEqual('a', 'a', 'test');
                    done();
            });
    });

    it('should get all emergency messages', function (done) {
        User.create(newuser)
            .then(()=>{
                return User.find().exec();})
            .then((users)=>{
                for(let i=0; i<users.length; i++){
                    testEmergency[i].sender = users[i]._id;
                    if(i<users.length-1){
                        testEmergency[i].receiver = users[i+1]._id;
                    }
                    else {
                        testEmergency[i].receiver = users[0]._id;
                    }
                }
                return Emergemcy.create(testEmergency);})
            .then(()=>{
                return Emergemcy.find().exec().then((emergencies)=>{
                    assert.strictEqual(3, emergencies.length, "did not get the right number of emergency message");
                    // assert.strictEqual('a', 'a', 'test');
                    done();
                });
            });
    });

    it('should get emergency message for users', function (done) {
        let message = emergencyController.getEmergencyMessage(newuser[0],'true');
        assert.strictEqual(message, newuser[0].emergency_message, "did not get the right emergency message");
        done();
    });

});


