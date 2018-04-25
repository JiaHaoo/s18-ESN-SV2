/* istanbul ignore file */
var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//mongoose.connect('mongodb://localhost:27017/esn');


var app = express();
var io = require('socket.io')();
app.io = io;

var index = require('./routes/index');
var announcements = require('./routes/announcements');
var announcementsApi = require('./routes/announcements_api')(io);
var users = require('./routes/users');
var usersApi = require('./routes/users_api')(io);
var rooms = require('./routes/rooms');
var roomsApi = require('./routes/rooms_api')(io);
var resourceMap = require('./routes/resourceMap');
var resourceMapApi = require('./routes/resourceMap_api');
var emergency_message = require('./routes/emergency_message');
var emergency_message_api = require('./routes/emergency_message_api')(io);

var guides = require('./routes/guides');
var guidesApi = require('./routes/guides_api')();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var expresssession = require('express-session');
//this option used for both express-session and passport-socketio
var expressoptions = {
  key: 'connect.sid',
  secret: 'keyboard cat',
  store: new expresssession.MemoryStore(),
  resave: false,
  saveUninitialized: false,
  cookieParser: cookieParser,
  passport: passport
};
app.use(cookieParser());
app.use(expresssession(expressoptions));
app.use(passport.initialize());
app.use(passport.session());

io.use(require('passport.socketio').authorize(expressoptions));


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/v1/announcements', announcementsApi);
app.use('/announcements', announcements);
app.use('/v1/users', usersApi);
app.use('/users', users);
app.use('/v1/rooms', roomsApi);
app.use('/rooms', rooms);
app.use('/resourceMap', resourceMap);
app.use('/v1/resourceMap', resourceMapApi);
app.use('/emergency_message', emergency_message);
app.use('/v1/emergencymessage', emergency_message_api);

app.use('/guides', guides);
app.use('/v1/guides', guidesApi);


// passport config
var User = require('./models/user.js');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/ESN');

var userController = require('./controllers/userController');
var adminName = 'ESNAdmin';
userController.findUserByUsername(adminName)
  .catch((err) => {
    //user not found, create it
    userController.createUser(adminName, 'admin', 'Administrator', 'ok');
  });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
