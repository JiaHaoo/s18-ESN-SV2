var User = require('../models/models').User;
var passport = require('passport');
var validation = require('../utils/validations');
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
function GetUsernamesByOnline() {
    return User.
        find({}).
        sort('username').
        exec()
        .then((users) => {
            let onlines = users.filter((user) => user.online === true).map((user) => [user.username, user.status]);
            let offlines = users.filter((user) => user.online === false).map((user) => [user.username,user.status]);
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
    return new Promise(function (resolve, reject) {
        User.register(new User({
            username: username,
            displayname: username,
            online: false,
            status: 'undefined',
            status_timestamp: Date.now(),
            rooms: ['000000000000']
        }), password, (err, account) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}



module.exports = {
    GetUsernamesByOnline: GetUsernamesByOnline,
    updateOnline: updateOnline,
    updateStatus: updateStatus,
    createUser: createUser
}