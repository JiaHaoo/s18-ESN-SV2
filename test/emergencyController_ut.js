var assert = require('assert');
var mongoose = require('mongoose');
var Announcement = require('../models/emergency.js');
var User = require('../models/user.js');
var Emergemcy = require('../models/emergency.js');
var Message = require('../models/message.js');
var Room = require('../models/room.js');

describe('emergency_controller', function () {
    var newuser=[{username:'apple', password:'apple123', online:true, status:'ok', emergency_contact:"banana", emergency_message:"hi"},
        {username:'banana', password:'banana123', online:false, status:'help',emergency_contact:"apple", emergency_message:"hello"},
        {username:'orange', password:'orange123', online:true, status:'emergency',emergency_contact:"apple", emergency_message:"hello world"}
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

    it('should get the users who has most chat history', function (done) {
        var message=[{sender:'', senderStatus:'online', room:'', timestamp:'2018-03-07T06:56:16.590Z', content:"hi"},
            {sender:'', senderStatus:'online', room:'', timestamp:'2018-03-07T06:56:16.590Z', content:"hi"},
            {sender:'', senderStatus:'online', room:'', timestamp:'2018-03-07T06:56:16.590Z', content:"hi"}
        ];
        var rooms = [{name:null, binary: true, users:[]},
            {name:null, binary: true, users:[]}];
        var user1 = "";
        var user2 = "";
        newuser[0].emergency_contact="";
        newuser[1].emergency_contact="";
        newuser[2].emergency_contact="";
        User.create(newuser).then(()=>{
            return User.find().exec().then((users)=>{
                rooms[0].users=[users[0]._id,users[1]._id];
                rooms[1].users=[users[1]._id,users[2]._id];
                return Room.create(rooms).then(()=>{
                    Room.find().populate({ path: 'users', select: ['username'] }).exec().then((room)=>{
                        message[0].sender = users[0]._id;
                        message[1].sender = users[0]._id;
                        message[2].sender = users[0]._id;
                        message[0].room = room[0]._id;
                        message[1].room = room[0]._id;
                        message[2].room = room[0]._id;
                        console.log(users[0].username);
                        console.log(users[1].username);
                        user1= users[0];
                        user2= users[1];
                        return Message.create(message).then(()=>{
                            return emergencyController.getEmergencyContact(user1).then((user_)=>{
                                console.log(user_[0]);
                                console.log(user2);
                                //assert.strictEqual(user_[0].username,user1.username, "did not get the right emergency contact");
                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    //get an online users as emergency contact
    var testuser=[{username:'apple_', password:'apple123', online:false, status:'ok'},
        {username:'banana_', password:'banana123', online:true, status:'help'},
        {username:'orange_', password:'orange123', online:false, status:'emergency'}
    ];

    it('should get emergencyContact who is online', function (done) {
        User.create(testuser)
            .then(()=>{
                return emergencyController.getEmergencyContact(testuser[0]);
            })
            .then((user)=>{

                console.log(user[0].username);
                //assert.strictEqual(user[0].username, "apple_", "did not get the right emergency contact");
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

    it('should get default message for users', function (done) {
        newuser[0].emergency_message="";
        var defaultMessage = "hi apple is in emergency. Please help him/her.";
        let message = emergencyController.getEmergencyMessage(newuser[0],'true');
        assert.strictEqual(message, defaultMessage, "did not get the right emergency message");
        done();
    });
});


