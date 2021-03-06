var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = mongoose.Schema({
    // username: unique, indexed, string.
    // a user can be determined by `_id`, like other resources
    // username should be used in login and potentially `@` features.
    username: { type: String, index: { unique: true } },

    // password: string.
    // for now just use cleartext, but we shall do something ...
    password: String,

    // displayname: string
    // for iteration 1, assign displayname = username when creation
    // but make sure all **display** in UI should show displayname, 
    // not username
    displayname: String,

    //account_status: string
    //accepts: ['Active', 'Inactive']
    //by default (on creation): 'Active'
    account_status: { type: String, default: 'Active' },

    //privilege_level: string
    //accepts: ['Administrator', 'Coordinator', 'Citizen']
    //by default (on creation): 'Citizen'
    privilege_level: { type: String, default: 'Citizen' },

    //online: Boolean
    online: Boolean,

    //status: string
    //really an enum, accepts: ['ok', 'help', 'emergency', 'undefined']
    //by default (on creation): 'undefined'
    status: String,

    //status_timestamp: Date
    status_timestamp: Date,

    // rooms: array of rooms, indexed.
    // if just `find` a user, in `thisuser.rooms` you get an array of ObjectId
    // you can use `mongoose.Model.populate` method 
    // to transform objectIds into real objects.
    // see https://stackoverflow.com/questions/36042284/mongoose-nested-reference-population
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room', index: true },],

    //emergency contact
    emergency_contact: String,

    //emergency message
    emergency_message: String
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.index({ username: 'text', status: 'text', displayname: 'text' });

module.exports = mongoose.model('User', UserSchema);