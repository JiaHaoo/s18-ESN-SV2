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

chai.use(chaiHttp);
chai.use(chaiSubset);


let agent = chai.request.agent(app);
let username = "testuser";
let password = "password123";

describe('test /v1/rooms', () => {

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
            .cleanModel(Message)
            .then(() => done());
    });

    it('should get 0 messages at new state', (done) => {
        agent
            .get('/v1/rooms/000000000000000000000000/messages')
            .end((err, res) => {
                // console.log(err, res);
                expect(res).to.have.status(200);
                expect(res.body).to.be.eql([]);
                done();
            })
    });

    it('should be able to put 1 message and get', (done) => {
        const room = '000000000000000000000000';
        const endpoint = '/v1/rooms/' + room + '/messages';
        const content = 'this is a msg!';
        const expected = { content: content, room: room, sender: { username: username } };
        agent
            .post(endpoint)
            .send({ content: content })
            .then((o) => agent.get(endpoint))
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.length(1);
                expect(res.body).to.deep.containSubset([expected]);
                done();
            })
            .catch(done);
    });
});

