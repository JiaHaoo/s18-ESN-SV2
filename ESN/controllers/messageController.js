var mongoose = require('mongoose');
var Message = require('../models/models').Message;

/**
 * saves a new message to MongoDB.
 * If success, contains message object
 * else, contains err
 * 
 * @param user: Mongoose User, may come from request if logged in
 * @param status: string, current status of user
 * @param room_id: string, room id
 * @return Promis
 */
function CreateMessageAndSave(user, content, room_id) {
    //create message
    var message = new Message();
    message.sender = user;
    message.senderStatus = user.status;
    message.content = content;
    message.timestamp = new Date();
    message.room = mongoose.Types.ObjectId(room_id);


    //save message to DB
    return message.save()
        .then(() => {
            return message.populate({ path: 'sender', select: 'username' });
        });
}

/**
 * get messages from a set of criteria.
 * Asynchronous. If get success, promise will hold array of Message.
 * 
 * @param room_id: string
 * @param sort_criteria: string, directly passed to Mongoose. see http://mongoosejs.com/docs/api.html#query_Query-sort
 * @param limit: int
 * @param offset: int
 * @return Promise
 */
function GetMessages(room_id, sort_criteria, limit, offset) {
    return Message
        .find({ room: mongoose.Types.ObjectId(room_id) })
        .sort(sort_criteria)
        .skip(offset)
        .limit(limit)
        .populate({ path: 'sender', select: 'username' })
        .exec();
}

module.exports = {
    CreateMessageAndSave: CreateMessageAndSave,
    GetMessages: GetMessages
};