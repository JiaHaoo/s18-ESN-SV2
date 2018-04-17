var express = require('express');
var passport = require('passport');
var loggedIn = require('../utils/loggedIn.js').loggedIn;
var userController = require('../controllers/userController.js');
var roomController = require('../controllers/roomController.js');
var emergencyController = require('../controllers/emergencyController.js');
// save emergency contact and message


module.exports = function (io) {

    io.on('connection', function (socket) {

        emergencyController.getAllEmergencyMessage()
            .then((emergencies) => {
               // console.log(emergencies);
                for(let j=0;j<emergencies.length;j++){
                    console.log(emergencies[j].ifShown);
                    if(emergencies[j].ifShown ==='true'){
                       // console.log('hhhhhhhh');
                        io.to(emergencies[j].receiver.username).emit('show_emergency', [emergencies[j]]);
                    }
                }
            });

    });

    var router = express.Router();
    router.post('/', function (req, res, next) {
        userController.updateEmergencyMessage(req.user, req.body.emergency_contact, req.body.emergency_message)
            .then(() => {
                res.status(200).send({});
            })
            .catch((err) => {
                res.status(400).send({ error: err });
            });
    });
//get room and send message
    router.get('/get_room',function(req, res, next){
        var user = req.query.username;
        console.log("c "+user);
        var isEmergency = req.query.isEmergency;
        //find or create the room for the 2 users
        userController.findUserByUsername(user).then((user_) =>{
            emergencyController.getEmergencyContact(user_).then((contact) =>{
                var emergency_contact = contact[0];
                console.log(contact);
                var emergency_message = emergencyController.getEmergencyMessage(user_,isEmergency);
                emergencyController.saveLatestEmergencyMessage(user_,emergency_message,emergency_contact).then((message)=>{
                    //console.log(message);
                    roomController.getOrCreateBinaryRoom(user_._id,emergency_contact._id).then((room)=>{
                       //to be changed !!!!
                        console.log(room);
                        io.to(emergency_contact.username).emit('show_emergency', message);
                        console.log("io send emergency message");
                        res.status(201).json({});
                    });

                });
            });
        });
    });

    router.post('/changeisshown', function(req, res, next){
        var userid = req.body.id;
        console.log(userid);
        emergencyController.changeStatus(userid).then(()=>{
            res.status(201).json({});
        });
    });


    return router;
};


