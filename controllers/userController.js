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
    var arg = {};
    if (query) {
        arg["$text"] = { $search: query };
    }

    return User
        .find(arg, { online: true, username: true, status: true })
        .sort(sorts)
        .skip(offset)
        .limit(count)
        .exec()
        .then((users) => {
            let onlines = users.filter((user) => user.online === true && user.account_status === "Active");
            let offlines = users.filter((user) => user.online === false && user.account_status === "Active");
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
function updateStatus(user, body) {
    console.log(body);
    var accept_status = ["ok", "help", "emergency", "undefined"];
    if (body.status) {
        if (!accept_status.includes(body.status)) {
            return Promise.reject({ name: "InvalidStatus", message: "status " + body.status + " is not accepted." });
        }
        user.status = body.status;
        user.status_timestamp = Date.now();
    }

    var accept_account_status = ['Active', 'Inactive'];
    if (body.accountStatus) {
        if (!accept_account_status.includes(body.accountStatus)) {
            return Promise.reject({ name: "InvalidAccountStatus", message: "account status " + body.accountStatus + " is not accepted." });
        }
        user.account_status = body.accountStatus;
    }

    var accept_privilege_level = ['Administrator', 'Coordinator', 'Citizen'];
    if (body.privilegeLevel) {
        if (!accept_privilege_level.includes(body.privilegeLevel)) {
            return Promise.reject({ name: "InvalidPrivilegeLevel", message: "privilege level  " + body.privilegeLevel + " is not accepted." });
        }
        user.privilege_level = body.privilegeLevel;
    }

    if (body.username) {
        if (!validation.UsernameIsGood(body.username)) {
            return Promise.reject({ name: 'InvalidUsernameError', message: body.username + ' is not a valid username' });
        }
    }

    if (body.password) {
        user.password = body.password;
    }
    return user.save();
}

function updateEmergencyMessage(user, emergency_contact, emergency_message) {
    return User.update({ username: user.username, }, { emergency_message: emergency_message, emergency_contact: emergency_contact, ifShown: 'ture' });
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
        return Promise.reject({ name: 'InvalidUsernameError', message: username + ' is not a valid username' });
    }
    return roomController.getPublicRoom()
        .then((room) => new Promise(function (resolve, reject) {
            User.count({}).exec().then((num) => {
                var privilege_level = 'Citizen';
                if (num === 0) {
                    privilege_level = 'Administrator';
                }
                User.register(new User({
                    username: username,
                    displayname: username,
                    account_status: 'Active',
                    privilege_level: privilege_level,
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
    return User.findOne({ username: username }).exec();
}



module.exports = {
    GetUsernamesByOnline: GetUsernamesByOnline,
    updateOnline: updateOnline,
    updateStatus: updateStatus,
    updateEmergencyMessage: updateEmergencyMessage,
    createUser: createUser,
    findUserByUsername: findUserByUsername
}