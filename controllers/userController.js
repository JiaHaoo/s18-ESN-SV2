var User = require('../models/models').User;
var passport = require('passport');
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
function GetUsernamesByOnlineStatus() {
    return User.
        find({}).
        sort('username').
        exec()
        .then((users) => {
            let onlines = users.filter((user) => user.status === 'online').map((user) => user.username);
            let offlines = users.filter((user) => user.status === 'offline').map((user) => user.username);
            return {
                online: onlines,
                offline: offlines
            };
        });
}
/**
 * change username in MongoDB from offline to onli
 *
 * @param: status
 * @param: username
 *
 * @return Promise
 */

function updateStatus(username, status){
    return User.update({ username: username }, { status: status});
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




module.exports = {
    GetUsernamesByOnlineStatus: GetUsernamesByOnlineStatus,
    updateStatus:updateStatus
}