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
let Resource = require('../models/resource');

chai.use(chaiHttp);
chai.use(chaiSubset);


let agent = chai.request.agent(app);
let username = "testuser";
let password = "password123";

describe('test /v1/resourceMap apis', () => {

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
            .cleanModel(Resource)
            .then(() => done());
    });

    it('should get 0 resources at new state', (done) => {
        agent
            .get('/v1/resourceMap/resources')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.eql([]);
                done();
            })
    });

    it('should be able to put 1 resource and get', (done) => {
        const resbody = {
            details: "fewag",
            latitude: "37.408954020882355",
            longitude: "-122.05062874702145",
            name: "123",
            quantity: "3",
            unit: "kk"
        };
        const endpoint = '/v1/resourceMap/resources';
        agent
            .post(endpoint)
            .send(resbody)
            .then((res) => {
                expect(res).to.have.status(201);
                return agent.get(endpoint);
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.length(1);
                done();
            })
            .catch(done);
    });
    it('should be able to put 1 unlimited resource and get', (done) => {
        const resbody = {
            details: "fewag",
            latitude: "37.408954020882355",
            longitude: "-122.05062874702145",
            name: "123",
            unlimited: true
        };
        const endpoint = '/v1/resourceMap/resources';
        agent
            .post(endpoint)
            .send(resbody)
            .then((res) => {
                expect(res).to.have.status(201);
                return agent.get(endpoint);
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.length(1);
                done();
            })
            .catch(done);
    });

    it('should be able to claim resource', (done) => {
        const resbody = {
            quantity: 10,
            unit: 'lb',
            name: 'potato',
            details: 'great potatoes',
            longitude: 1.2,
            latitude: -1.5
        };
        const claimed = 3;
        const endpoint = '/v1/resourceMap/resources';
        agent
            .post(endpoint)
            .send(resbody)
            .then((res) => {
                expect(res).to.have.status(201);
                return agent.get(endpoint);
            })
            .then((res) => {
                expect(res).to.have.status(200);
                const rid = res.body[0]._id;
                return agent
                    .post('/v1/resourceMap/resources/' + rid + '/claim')
                    .send({ amount: claimed });
            })
            .then((res) => {
                expect(res).to.have.status(201);
                return agent.get(endpoint);
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.length(1);
                expect(res.body[0].remainingQuantity).to.equal(resbody.quantity - claimed);
                done();
            })
            .catch(done);
    });
    it('should not be able to claim exausted resource', (done) => {
        const resbody = {
            quantity: 0,
            unit: 'lb',
            name: 'potato',
            details: 'great potatoes',
            unlimited: true
        };
        const claimed = 3;
        const endpoint = '/v1/resourceMap/resources';
        agent
            .post(endpoint)
            .send(resbody)
            .then((res) => {
                expect(res).to.have.status(201);
                return agent.get(endpoint);
            })
            .then((res) => {
                expect(res).to.have.status(200);
                const rid = res.body[0]._id;
                return agent
                    .post('/v1/resourceMap/resources/' + rid + '/claim')
                    .send({ amount: claimed });
            })
            .then((res) => {
                expect(res).to.have.status(500);
                done();
            })
            .catch(done);
    });
    it('should not be able to claim unlimited resource', (done) => {
        const resbody = {
            quantity: 10,
            unit: 'lb',
            name: 'potato',
            details: 'great potatoes',
            unlimited: true
        };
        const claimed = 3;
        const endpoint = '/v1/resourceMap/resources';
        agent
            .post(endpoint)
            .send(resbody)
            .then((res) => {
                expect(res).to.have.status(201);
                return agent.get(endpoint);
            })
            .then((res) => {
                expect(res).to.have.status(200);
                const rid = res.body[0]._id;
                return agent
                    .post('/v1/resourceMap/resources/' + rid + '/claim')
                    .send({ amount: claimed });
            })
            .then((res) => {
                expect(res).to.have.status(500);
                done();
            })
            .catch(done);
    });
    it('should be able to claim resource several times', (done) => {
        const resbody = {
            quantity: 10,
            unit: 'lb',
            name: 'potato',
            details: 'great potatoes',
            longitude: 1.2,
            latitude: -1.5
        };
        const claimed = 3;
        const endpoint = '/v1/resourceMap/resources';
        agent
            .post(endpoint)
            .send(resbody)
            .then((res) => {
                expect(res).to.have.status(201);
                return agent.get(endpoint);
            })
            .then((res) => {
                expect(res).to.have.status(200);
                const rid = res.body[0]._id;
                return agent
                    .post('/v1/resourceMap/resources/' + rid + '/claim')
                    .send({ amount: claimed })
                    .then((res) => {
                        expect(res).to.have.status(201);
                    })
                    .then((res) => {
                        return agent
                            .post('/v1/resourceMap/resources/' + rid + '/claim')
                            .send({ amount: claimed })
                    })
                    .then((res) => {
                        expect(res).to.have.status(201);
                    });
            })
            .then(() => { return agent.get(endpoint); })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.length(1);
                expect(res.body[0].remainingQuantity).to.equal(resbody.quantity - claimed * 2);
                done();
            })
            .catch(done);
    });
});

