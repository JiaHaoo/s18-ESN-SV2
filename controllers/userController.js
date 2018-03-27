var User = require('../models/user.js');
var Room = require('../models/room.js');
var passport = require('passport');
var validation = require('../utils/validations');
var roomController = require('../controllers/roomController');
/** 
 * get all users names from MongoDB, separated by online or not
 * if success, result contains:
 *      {
 *          online: Array of string (username),
 *          offline: Array of string (username)
 *      }
 *      
 * @return Promise
*/
function GetUsernamesByOnline(sorts, offset, count, query) {
    return User
        .find({}, {online: true, username: true, status: true})
        .sort(sorts)
        .skip(offset)
        .limit(count)
        .exec()
        .then((users) => {
            let onlines = users.filter((user) => user.online === true);
            let offlines = users.filter((user) => user.online === false);
            return {
                online: onlines,
                offline: offlines
            };
        });
}
/**
 * change username in MongoDB from offline to online
 *
 * @param: online, Boolean
 * @param: username
 *
 * @return Promise
 */

function updateOnline(username, online) {
    return User.update({ username: username }, { online: online });
}

/**
 * change user.status in MongoDB to desired one.
 * @param user: Mongoose Object
 * @param status: accept ["ok", "help", "emergency", "undefined"] 
 * @return Promise. 
 */
function updateStatus(user, status) {
    var accept_status = ["ok", "help", "emergency", "undefined"];
    if (!accept_status.includes(status)) {
        return new Promise.reject("status " + status + " is not accepted.");
    }
    user.status = status;
    user.status_timestamp = Date.now();
    return user.save();
}

/**
 * put a user  to MongoDB
 *
 * @param  username
 * @param status
 * @param password
 *
 * @return Promise
 */
function createUser(username, password) {
    if (!validation.UsernameIsGood(username)) {
        return new Promise.reject({ name: 'InvalidUsernameError', message: username + ' is not a valid username' });
    }
    return roomController.getPublicRoom()
        .then((room) => new Promise(function (resolve, reject) {
            User.register(new User({
                username: username,
                displayname: username,
                online: false,
                status: 'undefined',
                status_timestamp: Date.now(),
                rooms: [room]
            }), password, (err, account) => {
                if (err) {
                    reject(err);
                } else {
                    resolve([room, account]);
                }
            });
        }))
        .then((info) => {
            room = info[0];
            account = info[1];
            room.users.push(account);
            return room.save();
        });
}

function findUserByUsername(username) {
    return User.findOne({username: username}).exec();
}



module.exports = {
    GetUsernamesByOnline: GetUsernamesByOnline,
    updateOnline: updateOnline,
    updateStatus: updateStatus,
    createUser: createUser,
    findUserByUsername: findUserByUsername
}