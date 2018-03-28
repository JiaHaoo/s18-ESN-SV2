var assert = require('assert');
var mongoose = require('mongoose');
var User = require('../models/user.js');

describe('usercontroller_unit_test', function () {
    var newuser=[{username:'apple', password:'apple123', online:true, status:'ok'},
        {username:'banana', password:'banana123', online:false, status:'help'},
        {username:'orange', password:'orange123', online:true, status:'emergency'}
    ]
    before(function (done) {
        mongoose.connect('mongodb://127.0.0.1:27017/ESNTest');
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error'));
        db.once('open', function() {
            console.log('We are connected to test ----- database!');
            done();
        });
    });

    beforeEach((done) => {
        mongoose.connection.db.dropDatabase()
            .then(() => User.ensureIndexes())
            .then(done);
    });

    after((done) => {
        mongoose.connection.db.dropDatabase()
            .then(()=>mongoose.connection.close())
        .then(() => done());

    });

    var userController = require('../controllers/userController');

    it('should get the users by online and offline', function (done) {
        User.create(newuser)
            .then(()=>userController.GetUsernamesByOnline())
            .then((arr)=> {
                var gotuser=arr.online.map((a)=>a.username);
                var shouldbeuser=['apple', 'orange'];
                assert.deepEqual(gotuser,shouldbeuser,'get online users does not equal to expected result');
                done();
            });
    });

    it('should set updateOnline for user',function(done){
        User.create(newuser)
            .then(()=>userController.updateOnline('apple',false))
            .then(() => userController.findUserByUsername('apple'))
            .then((user)=> {
                assert.deepEqual(false, user.online, 'userOnline was not set as expected');
                done();
            });
            //.catch(done);
    }); 

    it('it should find user by username',function(done){
        User.create(newuser)
            .then(()=>userController.findUserByUsername('apple'))
            .then((user)=>{
                console.log(user.ObjectId)
                assert.deepEqual('apple', user.username, 'not find expected user');
                done();
            });
    });

    it('should set status for user',function(done){
        var testu={username:'apple'};
        User.create(newuser)
            .then(() => userController.findUserByUsername('apple'))
            .then((user) => userController.updateStatus(user,'undefined'))
            .then(() => userController.findUserByUsername('apple'))
            .then((user)=>{
                assert.deepEqual('undefined', user.status, 'user status is not set as expected');
                done();
            });
    });

    it('should creat new user', function(done){
        User.create(newuser)
            .then(()=>userController.createUser('dummy','dummy1111'))
            .then(()=>userController.findUserByUsername('dummy'))
            .then((user)=>{
                assert.deepEqual('dummy',user.username,'not creat new user as expected');
                done();
            })
    });

    it('should get users satisfying query', function(done){
        User.create(newuser)
            .then(()=>userController.GetUsernamesByOnline(undefined, 0, 10, 'appl'))
            .then((users)=>{
                assert.equal(1, users.online.length, 'not get satisfying users');
                done();
            })
    });

    it('should not get users unsatisfyint query', function(done){
        User.create(newuser)
            .then(()=>userController.GetUsernamesByOnline(undefined, 0, 10, 'appk'))
            .then((users)=>{
                assert.equal(0, users.online.length, 'get unsatisfying users');
                assert.equal(0, users.offline.length, 'get unsatisfying users');
                done();
            })
    })
})


