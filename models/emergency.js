var mongoose = require('mongoose');

var EmergencySchema = mongoose.Schema({

    //sender: ref to User.
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    //title: string. not null.

    //content: string. can be null.
    message: String,

    //timestamp: Date. indexed. can O(1) get latest, and get in sorted.
    timestamp: { type: Date, index: true },

    //receiver ref to User.
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    //if shown
    ifShown: String,
});

module.exports = mongoose.model('Emergency', EmergencySchema);