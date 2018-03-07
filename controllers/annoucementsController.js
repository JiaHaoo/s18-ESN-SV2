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
    return Announcement.find().skip(offset).limit(limit).exec();
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