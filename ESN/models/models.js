var mongoose = require('mongoose');

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

    // status: string
    // really an enum. Currently accept: "online", "offline"
    status: String,

    // rooms: array of rooms, indexed.
    // if just `find` a user, in `thisuser.rooms` you get an array of ObjectId
    // you can use `mongoose.Model.populate` method 
    // to transform objectIds into real objects.
    // see https://stackoverflow.com/questions/36042284/mongoose-nested-reference-population
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: RoomSchema, index: true }]
});

var MessageSchema = mongoose.Schema({

    // sender: ref to User. not indexed.
    sender: { type: mongoose.Schema.Types.ObjectId, ref: UserSchema },

    // room: ref to Room. Indexed.
    room: { type: mongoose.Schema.Types.ObjectId, ref: RoomSchema, index: true },

    // timestamp: Date. 
    // Should be stamped by server, not client.
    timestamp: Date,

    // content: string.
    content: String,
});

module.exports = {
    Room: mongoose.Model('Room', RoomSchema),
    User: mongoose.Model('User', UserSchema),
    Message: mongoose.Model('Message', MessageSchema)
}