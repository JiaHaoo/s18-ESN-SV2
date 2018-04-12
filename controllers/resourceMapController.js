var mongoose = require('mongoose');
var Resource = require('../models/resource');

function createResource(user, body) {

    let docs = {
        owner: user,
        name: body.name,
        details: body.details,
        location: {
            type: 'Point',
            coordinates: [
                parseFloat(body.longitude),
                parseFloat(body.latitude)
            ]
        }
    };
    //body do not have Object as prototype
    //https://github.com/nodejs/node/pull/6289
    if (Object.prototype.hasOwnProperty.call(body, 'unlimited')) {
        docs.unlimited = true;
    } else {
        docs.unlimited = false;
        docs.quantity = body.quantity;
        docs.remainingQuantity = body.quantity;
        docs.unit = body.unit;
    }
    return (new Resource(docs)).save();
}

function claimResource(user, resourceId, amount) {

    return Resource
        .findById(resourceId)
        .populate("claimers", ["user", "amount"])
        .populate("claimers.user", ["_id"])
        .then((resource) => {
            if (resource.unlimited) {
                throw "cannot claim an unlimited resource";
            }
            if (resource.remainingQuantity < amount) {
                //throw!
                throw "tried to claim amount (" + amount + ") more than remaining quantity (" + resource.remainingQuantity + ")";
            }

            resource.remainingQuantity -= amount;

            var claimer = resource.claimers.find((o) => o.user._id === user._id);
            if (claimer) {
                claimer.amount += amount;
            } else {
                resource.claimers.push({ user: user, amount: amount });
            }
            return resource.save();
        })
}

function getResources() {
    return Resource.find()
        .populate("owner", ["username", "displayname"])
        .populate("claimers.user", "username");
}

module.exports = {
    createResource: createResource,
    claimResource: claimResource,
    getResources: getResources
}