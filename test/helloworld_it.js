process.env.MONGODB_URI = 'mongodb://127.0.0.1/ESNTest';

let chai = require('chai');
let assert = require('assert');
let app = require('../app.js');
let should = chai.should();
let chaiHttp = require('chai-http');

chai.use(chaiHttp);


describe('Test framework works', () => {
    it('should correctly set environment variables for the app', () => {
        assert.equal(process.env.MONGODB_URI, 'mongodb://127.0.0.1/ESNTest');
    });

    it('should open server and get a login page', () => {
        chai.request(app) //open the server and try to test it
            .get('/')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
});

