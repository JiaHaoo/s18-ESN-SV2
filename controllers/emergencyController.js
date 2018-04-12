var mongoose = require('mongoose');
var User = require('../models/user.js');
var Message = require('../models/message.js');
var userController = require('../controllers/userController.js');
var roomController = require('../controllers/roomController.js');
var Emergency = require('../models/emergency.js');

//get the username of user's emergency contact
function getEmergencyContact(user){
    console.log(user);
    console.log("test");
    if(user.emergency_contact === "please choose your emergency contact" || user.emergency_contact === undefined){
        return Message.find({sender:user._id}).exec().then((messages) =>{
            //console.log("aaaa"+messages);
            var emergency_contact ='';
            for(let i=0; i<messages.length; i++){
                if(messages[i].room.toString() !== '000000000000000000000000'){
                    return roomController.getRoomById(messages[i].room).then((room)=>{
                        for(let j=0;j<room.users.length;j++){
                            if(room.users[j]._id !== user._id){
                                return User.find({_id:room.users[j]._id}).exec();
                            }
                        }
                    });
                }
            }
            return userController.GetUsernamesByOnline().then((users)=>{
                for(let i=0; i<users.length; i++){
                    if(users[i]._id !== user._id){
                        return User.find({username:users[i].username}).exec();
                    }
                }
                return User.find().exec();
            });

        });
    }
    else{
        console.log("find contact");
        return User.find({username:user.emergency_contact}).exec();

    }
}

function getAllEmergencyMessage() {

    return Emergency
        .find()
        .populate({ path: 'receiver', select: 'username'})
        .populate({ path: 'sender', select: 'username'})
        .exec();
}


function changeStatus(sender){
    console.log("change status");
    return Emergency.find({sender:sender}).exec().then((messages)=>{
        console.log(messages);
        return Emergency.update({sender:sender},{ifShown: 'false'});
    });
}


//get the users emergency message

function getEmergencyMessage(user,state){
    if(state === 'true'){
        //new status is emergency
        //console.log(user);
        var emergency_message = user.emergency_message;
        if(emergency_message === undefined){
            emergency_message = "hi "+user.username + "is in emergency. Please help him/her.";
            return emergency_message;
        }
        else{
            return emergency_message;
        }
    }
    else{
        //change from emergency to others
        return "The emergency of "+user.username+" have been solved. Thanks for your help.";
    }
}

//for a same sender, only save the one for the latest emergency status
//before save, search and delete existing ones

function saveLatestEmergencyMessage(sender,message, receiver){
    var emergency = new Emergency();
    emergency.sender = sender._id;
    emergency.receiver = receiver._id;
    emergency.message = message;
    emergency.timestamp = new Date();
    emergency.ifShown = 'true';

    //save message to DB
    return Emergency.find({sender:sender._id}).exec().then((messages)=>{
        if(messages.length === 0){
            return emergency.save()
                .then(() => {
                    return Emergency.find({sender: sender._id}).populate({ path: 'sender', select: 'username' }).populate({ path: 'receiver', select: 'username' });
                });
        }
        else{
            return Emergency.update({sender:sender},{message:message, timestamp: emergency.timestamp, receiver:receiver, ifShown: 'true'})
                .then(()=>{
                    return Emergency.find({sender: sender._id}).populate({ path: 'sender', select: 'username' }).populate({ path: 'receiver', select: 'username' });
                });
        }
    });

}

module.exports = {
    getEmergencyContact: getEmergencyContact,
    getEmergencyMessage: getEmergencyMessage,
    saveLatestEmergencyMessage:saveLatestEmergencyMessage,
    getAllEmergencyMessage: getAllEmergencyMessage,
    changeStatus:changeStatus
};
