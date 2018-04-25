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

    it('cant register with an already-registered username', (done) => {
        agent
            .post('/v1/users/' + username)
            .send({ username: username, password: password })
            .then((o) => {
                expect(o).to.have.status(403);
                done();
            });
    });


    it('cant log in with a wrong password', (done) => {
        agent
            .post('/v1/users')
            .send({ username: username, password: password + 'x' })
            .then((res) => {
                expect(res).to.have.status(401);
                done();
            });
    })

    it('should be able to update status to help', (done) => {
        agent
            .put('/v1/users/' + username)
            .send({ status: 'help' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('cant update status to non pre-defined status', (done) => {
        agent
            .put('/v1/users/' + username)
            .send({ status: 'xxx' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });


    it('should get a user list', (done) => {
        agent
            .get('/v1/users?sort=+online,+username')
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.online).to.have.length(0);
                expect(res.body.offline).to.have.length(1);
                done();
            })
            .catch(done);
    });

    it('should reject invalid query value', (done) => {
        agent
            .get('/v1/users?offset=0.01')
            .then((res) => {
                expect(res).to.have.status(400);
                done();
            })
            .catch(done);
    });
});

