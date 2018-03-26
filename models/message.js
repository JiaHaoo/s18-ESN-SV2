var mongoose = require('mongoose')

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

MessageSchema.index({ content: 'text' });

module.exports = mongoose.model('Message', MessageSchema);