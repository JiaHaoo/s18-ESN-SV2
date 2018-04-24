process.env.MONGODB_URI = 'mongodb://127.0.0.1/ESNTest';

let chai = require('chai');
// let chaiHttp = require('chai-http');
var chaiSubset = require('chai-subset');

let assert = require('assert');
let expect = chai.expect;

let mongoose = require('mongoose');
let cleanDatabase = require('../utils/cleanDatabase');

let User = require('../models/user');
let Resource = require('../models/resource');

// chai.use(chaiHttp);
chai.use(chaiSubset);


/**
 * before any use case: connect to test mongoDB db
 * before each `it`: drop database
 */
describe('resource schema', function () {

    const userOwner = new User({ username: 'owner', password: '123', displayname: 'ownerdisp' });
    const userClaimer = new User({ username: 'claimer', password: '123', displayname: 'claimerdisp' });
    const res1 = {
        owner: userOwner,
        claimers: [{ user: userClaimer, amount: 1 }],
        quantity: 10,
        unit: 'lb',
        name: 'potato',
        details: 'great potatoes',
        unlimited: false,
        location: { type: 'Point', coordinates: [1.5, -2.5] }
    };

    before(function (done) {
        mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error'));
        db.once('open', function () {
            console.log('We are connected to test database!');
            done();
        });
    });

    beforeEach((done) => {
        cleanDatabase.cleanDatabase()
            .then(done);
    });

    after((done) => {
        mongoose.connection.db.dropDatabase()
            .then(() => mongoose.connection.close())
            .then(done);
    });

    it('should save resource in db', function (done) {
        const res = new Resource(res1);
        res.save()
            .then(() => {
                return Resource.findOne().exec()
            })
            .then((r) => {
                console.log(r);
                expect(r).to.deep.containSubset({
                    owner: userOwner._id,
                    claimers: [{ user: userClaimer._id, amount: 1 }],
                    unit: res1.unit,
                    unlimited: res1.unlimited
                });

                done();
            });

    });

    it('should get nearby location', function (done) {
        const res = new Resource(res1);
        res.save()
            .then(() => {
                return Resource.findOne().exec()
            })
            .then((r) => {
                console.log(r);
                expect(r).to.deep.containSubset({
                    owner: userOwner._id,
                    claimers: [{ user: userClaimer._id, amount: 1 }],
                    unit: res1.unit,
                    unlimited: res1.unlimited
                });

                done();
            });

    });

});