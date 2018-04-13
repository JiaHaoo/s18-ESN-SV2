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
let Emergency = require('../models/emergency');

chai.use(chaiHttp);
chai.use(chaiSubset);


let agent = chai.request.agent(app);
let username = "testuser";
let password = "password123";

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
            .then(() => User.create(newuser))
            .then(() => User.find().exec())
            .then((users) => {
               fetchuser = users;
               done();
            });

    });

    it('should change status', (done) => {
        agent
            .post('/v1/emergency/changeisshown')
            .send({id:'5acfb24a26ecb1099544fb88'})
            .then((res) => {
                expect(res).to.have.status(201);
                done();
            })
            .catch(done);
    });

});