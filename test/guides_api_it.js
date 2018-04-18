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
let Message = require('../models/message');
let Guide = require('../models/guide');

chai.use(chaiHttp);
chai.use(chaiSubset);


let agent = chai.request.agent(app);
let username = "testuser";
let password = "password123";

describe('test /v1/guides', () => {

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
            .cleanModel(Guide)
            .then(() => done());
    });

    it('should get 0 guides at new state', (done) => {
        agent
            .get('/v1/guides?tags=tag1,tag2')
            .end((err, res) => {
                // console.log(err, res);
                expect(res).to.have.status(200);
                expect(res.body.guides).to.be.deep.equal([]);
                done();
            })
    });

    it('should get a error response', (done) => {
        agent
            .get('/v1/guides?offset=-1&limit=-1')
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('should reject the request due to title length limit', (done) => {
        agent.
            post('/v1/guides')
            .send({ title: '12345678901234567890123456789012345678901' })
            .end((err, res) => {
                expect(res).to.have.status(403);
                done();
            })
    });

    it('should be able to put 1 guide and get', (done) => {
        const endpoint = '/v1/guides';
        const title = 'guide1';
        const content = 'this is an guide!';
        const tags = 'tag1, tag2';
        agent
            .post(endpoint)
            .send({ title: title, content: content, tags: tags })
            .then((o) => agent.get(endpoint))
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.guides).to.have.length(1);
                done();
            })
            .catch(done);
    });

    it('should be able to get the guide by key word', (done) => {
        const endpoint = '/v1/guides';
        const title = 'guide1';
        const content = 'this is an guide!';
        const tags = 'tag1, tag2';
        agent
            .post(endpoint)
            .send({ title: title, content: content, tags: tags })
            .then((o) => agent.get(endpoint + '?query=tag1'))
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.guides).to.have.length(1);
                done();
            })
            .catch(done);
    });

    it('should be able to get 0 guide by key word', (done) => {
        const endpoint = '/v1/guides';
        const title = 'guide1';
        const content = 'this is an guide!';
        const tags = 'tag1, tag2';
        agent
            .post(endpoint)
            .send({ title: title, content: content, tags: tags })
            .then((o) => agent.get(endpoint + '?query=xxx'))
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.guides).to.have.length(0);
                done();
            })
            .catch(done);
    });
});