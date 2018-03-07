var mongoose = require('mongoose');
var Announcement = require('../models/models').Announcement;

/**
 * return count in Promise.
 * 
 * @return Promise
 */
function getAnnouncementCount() {
    return Announcement.count().exec();
}

/**
 * too simple, no docs!
 * just read code
 * 
 * @return Promise
 */
function getAnnouncements(limit, offset) {
    return Announcement
        .find()
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit)
        .populate({ path: 'sender', select: ['username', 'displayname'] })
        .exec();
}

/**
 * too simple, no docs!
 * just read code
 * 
 * @return Promise
 */
function putAnnouncement(title, content, user) {
    return (new Announcement({
        sender: user,
        title: title,
        content: content,
        timestamp: new Date()
    })).save();
}

module.exports = {
    getAnnouncementCount: getAnnouncementCount,
    getAnnouncements: getAnnouncements,
    putAnnouncement: putAnnouncement
}