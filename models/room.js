var mongoose = require('mongoose');

//one need to add a `public` room as default.
var RoomSchema = mongoose.Schema({
    //name: string. may duplicate, no care.
    name: String,

    //binary: Boolean.
    //if true:
    //  this room has only 2 user
    //  front end should display friend's name
    //if false:
    //  is multiple user
    //  front end should display room name
    binary: Boolean,

    //users
    //indexed
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }]
});

module.exports = mongoose.model('Room', RoomSchema);