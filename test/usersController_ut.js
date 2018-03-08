var assert = require('assert');
var mongoose = require('mongoose');
var models = require('../models/models');

describe('usercontroller_unit_test', function () {
    var newuser=[{username:'apple', password:'apple123', online:true, status:'ok'},
        {username:'banana', password:'banana123', online:false, status:'help'},
        {username:'orange', password:'orange123', online:true, status:'emergency'}
    ]
    before(function (done) {
        mongoose.connect('mongodb://localhost/ESNTest');
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error'));
        db.once('open', function() {
            console.log('We are connected to test ----- database!');
            done();
        });
    });

    beforeEach((done) => {
       mongoose.connection.db.dropDatabase()
        .then(() => done());
    });

    after((done) => {
        mongoose.connection.db.dropDatabase()
            .then(()=>mongoose.connection.close())
        .then(() => done());

    });

    var userController = require('../controllers/userController');

    it('should get the users by online and offline', function (done) {
        models.User.create(newuser)
            .then(()=>userController.GetUsernamesByOnline())
            .then((arr)=> {
                var gotuser=arr.online.map((a)=>a[0]);
                var shouldbeuser=['apple', 'orange'];
                assert.deepEqual(gotuser,shouldbeuser,'get online users does not equal to expected result');
                done();
            });
    });

    it('should set updateOnline for user',function(done){
        models.User.create(newuser)
            .then(()=>userController.updateOnline('apple',false))
            .then(() => userController.findUserByUsername('apple'))
            .then((user)=> {
                assert.deepEqual(false, user.online, 'userOnline was not set as expected');
                done();
            });
            //.catch(done);
    }); 

    it('it should find user by username',function(done){
        models.User.create(newuser)
            .then(()=>userController.findUserByUsername('apple'))
            .then((user)=>{
                console.log(user.ObjectId)
                assert.deepEqual('apple', user.username, 'not find expected user');
                done();
            });
    });

    it('should set status for user',function(done){
        var testu={username:'apple'};
        models.User.create(newuser)
            .then(() => userController.findUserByUsername('apple'))
            .then((user) => userController.updateStatus(user,'undefined'))
            .then(() => userController.findUserByUsername('apple'))
            .then((user)=>{
                assert.deepEqual('undefined', user.status, 'user status is not set as expected');
                done();
            });
    });

    it('should creat new user', function(done){
        models.User.create(newuser)
            .then(()=>userController.createUser('dummy','dummy1111'))
            .then(()=>userController.findUserByUsername('dummy'))
            .then((user)=>{
                assert.deepEqual('dummy',user.username,'not creat new user as expected');
                done();
            })
    });

})


