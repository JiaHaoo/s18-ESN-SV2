var mongoose = require('mongoose');

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
AnnouncementSchema.index({ content: 'text',  title: 'text'});

module.exports = mongoose.model('Announcement', AnnouncementSchema);