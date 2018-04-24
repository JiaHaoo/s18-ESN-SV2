process.env.MONGODB_URI = 'mongodb://127.0.0.1/ESNTest';

let chai = require('chai');
let chaiSubset = require('chai-subset');
let assert = require('assert');
let expect = chai.expect;
chai.use(chaiSubset);

let mongoose = require('mongoose');
let cleanDatabase = require('../utils/cleanDatabase');

let User = require('../models/user');
let Resource = require('../models/resource');
let ResourceMapController = require('../controllers/resourceMapController');



/**
 * before any use case: connect to test mongoDB db
 * before each `it`: drop database
 */
describe('resource map controller', function () {

    const userOwner = new User({ username: 'owner', password: '123', displayname: 'ownerdisp' });
    const userClaimer = new User({ username: 'claimer', password: '123', displayname: 'claimerdisp' });
    const resbody1 = {
        quantity: 10,
        unit: 'lb',
        name: 'potato',
        details: 'great potatoes',
        longitude: 1.2,
        latitude: -1.5
    };

    const resbody2 = {
        quantity: 100,
        unit: 'kg',
        name: 'tomato',
        details: 'great tomaaaato',
        longitude: 1.2,
        latitude: -10.5
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

    it('should save 1 resource in db', function (done) {
        ResourceMapController.createResource(userOwner, resbody1)
            .then(() => {
                return Resource.count().exec();
            })
            .then((c) => {
                expect(c).to.equal(1);
                done();
            })
    });


    it('should correctly get resources', function (done) {
        ResourceMapController.createResource(userOwner, resbody1)
            .then(() => {
                let createPromise =
                    ResourceMapController.createResource(userOwner, resbody2);
                return createPromise;
            })
            .then(() => {
                return ResourceMapController.getResources();
            })
            .then((rs) => {
                expect(rs).to.have.lengthOf(2);
                done();
            })
            .catch(done);

    });


    it('should correctly claim amount of resource', function (done) {
        ResourceMapController.createResource(userOwner, resbody1)
            .then((r) => {
                return ResourceMapController.claimResource(userClaimer, r._id, 5);
            })
            .then((r) => {
                //can claim my own resource
                let prom = ResourceMapController.claimResource(userOwner, r._id, 1);
                return prom;
            })
            .then(() => {
                return ResourceMapController.getResources();
            })
            .then((rs) => {
                expect(rs[0].remainingQuantity).to.equal(4);
                done();
            })
            .catch(done);

    });

});