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

chai.use(chaiHttp);
chai.use(chaiSubset);


let agent = chai.request.agent(app);
let username = "testuser";
let password = "password123";

describe('test /v1/users apis', () => {

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
                expect(o).to.have.status(201);
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


    it('should be able to update status to help', (done) => {
        agent
            .put('/v1/users/' + username)
            .send({ status: 'help' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('should get a user list', (done) => {
        agent
            .get('/v1/users')
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.online).to.have.length(0);
                expect(res.body.offline).to.have.length(1);
                done();
            })
            .catch(done);
    });
});

