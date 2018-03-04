var User = require('../models/models').User;

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

module.exports = {
    GetUsernamesByOnlineStatus: GetUsernamesByOnlineStatus
}