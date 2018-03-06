var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

//one need to add a `public` room as default.
var RoomSchema = mongoose.Schema({
    //name: string. may duplicate, no care.
    name: String,
});

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
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room', index: true }]
});

UserSchema.plugin(passportLocalMongoose);

var MessageSchema = mongoose.Schema({

    // sender: ref to User. not indexed.
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // senderStatus: String.
    // status at the time of sender send. occupied by server (not client)
    senderStatus: String,

    // room: ref to Room. Indexed.
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', index: true },

    // timestamp: Date. 
    // Should be stamped by server, not client.
    timestamp: Date,

    // content: string.
    content: String,
});

var AnnouncementSchema = mongoose.Schema({

    //sender: ref to User.
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    //title: string. not null.
    title: String,

    //content: string. can be null.
    content: String,

    //timestamp: Date. indexed. can O(1) get latest, and get in sorted.
    timestamp: { type: Date, index: true },

});

module.exports = {
    Room: mongoose.model('Room', RoomSchema),
    User: mongoose.model('User', UserSchema),
    Message: mongoose.model('Message', MessageSchema),
    Announcement: mongoose.model('Announcement', AnnouncementSchema)
};
