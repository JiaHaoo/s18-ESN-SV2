process.env.MONGODB_URI = 'mongodb://127.0.0.1/ESNTest';

let chai = require('chai');
let chaiHttp = require('chai-http');
var chaiSubset = require('chai-subset');

let assert = require('assert');
let expect = chai.expect;

let app = require('../app.js');
let mongoose = require('mongoose');
let cleanDatabase = require('../utils/cleanDatabase');
let User = require('../models/user');
var Emergency = require('../models/emergency');

chai.use(chaiHttp);
chai.use(chaiSubset);


let agent = chai.request.agent(app);
let username = "testuser";
let password = "password123";

var testEmergency = [{ sender: "", timestamp: "2018-03-07T06:56:16.590Z", message: "aaa",receiver: "", ifShown: 'true' },
    { sender: "", timestamp: "2018-03-07T06:56:34.535Z", message: "bbb",receiver: "", ifShown: 'true' },
    { sender: "", timestamp: "2018-03-07T07:04:36.068Z", message: "ccc",receiver: "",ifShown: 'true' }];

describe('test /v1/emergency', () => {

    var newuser=[{username:'apple', password:'apple123', online:true, status:'ok', emergency_contact:"banana", emergency_message:"hi"},
        {username:'banana', password:'banana123', online:false, status:'help',emergency_contact:"apple", emergency_message:"hello"},
        {username:'orange', password:'orange123', online:true, status:'emergency'}
    ];


    var fetchuser=[];

    before((done) => {
        //before anything happens:
        //1. clean database
        //2. register
        //3. log in

        cleanDatabase.cleanDatabase()
            .then(() => {
                return agent
                    .post('/v1/users/' + username) //register
                    .send({ username: username, password: password });
            })
            .then((o) => {
                return agent
                    .post('/v1/users') // log in
                    .send({ username: username, password: password });
            })
            .then((res) => {
                //res is response of `/v1/users`
                expect(res).to.have.status(200);
                expect(res).to.have.cookie('connect.sid');
                // The `agent` now has the sessionid cookie saved, and will send it
                // back to the server in the next request
            })
            .then(done)
            .catch((err) => console.log(err));
    });


    beforeEach((done) => {
        cleanDatabase
            .cleanModel(Emergency)
            .then(() => done());
    });

    it('should change status', (done) => {
        User.create(newuser)
            .then(()=>{
                return User.find().exec();})
            .then((users)=>{
                for(let i=0; i<3; i++){
                    testEmergency[i].sender = users[i]._id;
                    if(i<users.length-1){
                        testEmergency[i].receiver = users[i+1]._id;
                    }
                    else {
                        testEmergency[i].receiver = users[0]._id;
                    }
                }
                return Emergency.create(testEmergency);})
            .then(()=>{
                agent
                    .post('/v1/emergencymessage/changeisshown')
                    .send({id:'5acfb24a26ecb1099544fb88'})
                    .then((res) => {
                        expect(res).to.have.status(201);
                        done();
                    })
                    .catch(done);
            });
    });

    it('should get room', (done) => {
        User.find().exec()
            .then((users)=>{
                for(let i=0; i<3; i++){
                    testEmergency[i].sender = users[i]._id;
                    if(i<users.length-1){
                        testEmergency[i].receiver = users[i+1]._id;
                    }
                    else {
                        testEmergency[i].receiver = users[0]._id;
                    }
                }
                return Emergency.create(testEmergency);})
            .then(()=>{
                agent
                    .get('/v1/emergencymessage/get_room?username=apple&isEmergency=true')
                    .end((err, res) => {
                        // console.log(err, res);
                        expect(res).to.have.status(201);
                        expect(res.body).to.be.eql({});
                        done();
                    });
            });
    });

    it('should add emergency message', (done) => {
        User.find().exec()
            .then((users)=>{
                for(let i=0; i<3; i++){
                    testEmergency[i].sender = users[i]._id;
                    if(i<users.length-1){
                        testEmergency[i].receiver = users[i+1]._id;
                    }
                    else {
                        testEmergency[i].receiver = users[0]._id;
                    }
                }
                return Emergency.create(testEmergency);})
            .then(()=>{
                agent
                    .post('/v1/emergencymessage/')
                    .send({emergency_contact:"apple", emergency_message:"hi"})
                    .then((res) => {
                        expect(res).to.have.status(200);
                        done();
                    })
                    .catch(done);
            });
    });

});