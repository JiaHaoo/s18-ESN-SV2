var mongoose = require('mongoose');
var Room = require('../models/models').Room;
var User = require('../models/models').User;

/** 
 * if there is no such binary room, create one 
 * @returns Promise
*/
function getOrCreateBinaryRoom(user1, user2) {
    return Room.findOne({ binary: true, users: { $all: [user1, user2] } })
        .exec()
        .then((room) => {
            if (!room) {
                return (new Room({
                    name: null,
                    binary: true,
                    users: [user1, user2]
                })).save();
            } else {
                return Promise.resolve(room);
            }
        });
}

/** 
 * @returns Promise
*/
function getPublicRoom() {
    return Room.findById("000000000000000000000000")
        .exec()
        .then((room) => {
            if (!room) {
                return (new Room({
                    _id: "000000000000000000000000",
                    name: "Public",
                    binary: false,
                    users: []
                })).save();
            } else {
                return Promise.resolve(room);
            }
        });
}

/**
 * if exist, resolve with room object
 * if not exist, reject
 * @param {*} room_id 
 */
function getRoomById(room_id) {
    return Room.findById(room_id)
        .then((room) => {
            if (!room) {
                return Promise.reject("room id not exist");
            } else {
                return Promise.resolve(room);
            }
        });
}

module.exports = {
    getOrCreateBinaryRoom: getOrCreateBinaryRoom,
    getPublicRoom: getPublicRoom,
    getRoomById: getRoomById
}