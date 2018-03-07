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

/**
 * get latest announcement.
 *  if succ: carry the latest announcement object
 *  if not found: reject the Promise.
 *
 *  @return Promise
 */
function latestAnnouncement() {
    return Announcement.findOne()
        .sort({timestamp:-1})
        .populate({ path: 'sender', select: ['username', 'displayname'] })
        .exec();
}

module.exports = {
    getAnnouncementCount: getAnnouncementCount,
    getAnnouncements: getAnnouncements,
    putAnnouncement: putAnnouncement,
    latestAnnouncement: latestAnnouncement
}