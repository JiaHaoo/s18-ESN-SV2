var express = require('express');

var User = require('../models/models.js').User;
var passport = require('passport');
var loggedIn = require('./loggedIn.js');


function checkAvailability(str) {
    if(str.length < 3)
        return false;
    if(!str.match(/^[0-9a-zA-Z_]+[0-9a-zA-Z_-]*[0-9a-zA-Z_]+$/))
        return false;
    var reservedList = ['about', 'access', 'account', 'accounts', 'add', 'address', 'adm', 'admin', 'administration', 
    'adult', 'advertising', 'affiliate', 'affiliates', 'ajax', 'analytics', 'android', 'anon', 'anonymous', 'api', 
    'app', 'apps', 'archive', 'atom', 'auth', 'authentication', 'avatar', 'backup', 'banner', 'banners', 'bin', 
    'billing', 'blog', 'blogs', 'board', 'bot', 'bots', 'business', 'chat', 'cache', 'cadastro', 'calendar', 'campaign', 
    'careers', 'cgi', 'client', 'cliente', 'code', 'comercial', 'compare', 'config', 'connect', 'contact', 'contest', 
    'create', 'code', 'compras', 'css', 'dashboard', 'data', 'db', 'design', 'delete', 'demo', 'design', 'designer', 
    'dev', 'devel', 'dir', 'directory', 'doc', 'docs', 'domain', 'download', 'downloads', 'edit', 'editor', 'email', 
    'ecommerce', 'forum', 'forums', 'faq', 'favorite', 'feed', 'feedback', 'flog', 'follow', 'file', 'files', 'free', 
    'ftp', 'gadget', 'gadgets', 'games', 'guest', 'group', 'groups', 'help', 'home', 'homepage', 'host', 'hosting', 
    'hostname', 'html', 'http', 'httpd', 'https', 'hpg', 'info', 'information', 'image', 'img', 'images', 'imap', 
    'index', 'invite', 'intranet', 'indice', 'ipad', 'iphone', 'irc', 'java', 'javascript', 'job', 'jobs', 'js', 
    'knowledgebase', 'log', 'login', 'logs', 'logout', 'list', 'lists', 'mail', 'mail1', 'mail2', 'mail3', 'mail4', 
    'mail5', 'mailer', 'mailing', 'mx', 'manager', 'marketing', 'master', 'me', 'media', 'message', 'microblog', 'microblogs', 
    'mine', 'mp3', 'msg', 'msn', 'mysql', 'messenger', 'mob', 'mobile', 'movie', 'movies', 'music', 'musicas', 'my', 'name', 
    'named', 'net', 'network', 'new', 'news', 'newsletter', 'nick', 'nickname', 'notes', 'noticias', 'ns', 'ns1', 'ns2', 'ns3', 
    'ns4', 'old', 'online', 'operator', 'order', 'orders', 'page', 'pager', 'pages', 'panel', 'password', 'perl', 'pic', 'pics', 
    'photo', 'photos', 'photoalbum', 'php', 'plugin', 'plugins', 'pop', 'pop3', 'post', 'postmaster', 'postfix', 'posts', 'profile', 
    'project', 'projects', 'promo', 'pub', 'public', 'python', 'random', 'register', 'registration', 'root', 'ruby', 'rss', 'sale', 
    'sales', 'sample', 'samples', 'script', 'scripts', 'secure', 'send', 'service', 'shop', 'sql', 'signup', 'signin', 'search', 
    'security', 'settings', 'setting', 'setup', 'site', 'sites', 'sitemap', 'smtp', 'soporte', 'ssh', 'stage', 'staging', 'start', 
    'subscribe', 'subdomain', 'suporte', 'support', 'stat', 'static', 'stats', 'status', 'store', 'stores', 'system', 'tablet', 
    'tablets', 'tech', 'telnet', 'test', 'test1', 'test2', 'test3', 'teste', 'tests', 'theme', 'themes', 'tmp', 'todo', 'task', 
    'tasks', 'tools', 'tv', 'talk', 'update', 'upload', 'url', 'user', 'username', 'usuario', 'usage', 'vendas', 'video', 'videos', 
    'visitor', 'win', 'ww', 'www', 'www1', 'www2', 'www3', 'www4', 'www5', 'www6', 'www7', 'wwww', 'wws', 'wwws', 'web', 'webmail', 
    'website', 'websites', 'webmaster', 'workshop', 'xxx', 'xpg', 'you', 'yourname', 'yourusername', 'yoursite', 'yourdomain'];
    for(var ele of reservedList) {
        if (ele === str)
            return false;
    }
    return true;
}

function broadcastUserList(io) {
    User.
    find({}).
    sort('username').
    exec(function(err,alluser){
        //  var onlines=[];
        //  var offlines=[];

        var onlines=alluser.filter(function(user){
            return user.status === 'online'
        });
        var offlines=alluser.filter(function(user){
            return user.status === 'offline'
        });
        var onl_map = onlines.map(x => x.username);
        var offl_map = offlines.map(x => x.username);
        io.emit('userlist_update',{online:onl_map,offline:offl_map});
    });
}

module.exports = function (io) {
    var router = express.Router();
    var id_name={};

    io.on('connection',function(socket){
     //   socket.on('user_offline',function(data){
     //       id_name[socket.id]=data;
     //       console.log('socket id name pair.....................................');
     //   });
        socket.on('disconnect',function(){
            User.update({username: socket.request.user.username}, {status: 'offline'}, function (err, docs) {
                if (err) console.log(err);
                broadcastUserList(io);
            });
        });
        broadcastUserList(io);
    });




    // Get Main Page After Login
    router.get('/:username',
        loggedIn,
        function(req, res, next) {
            User.update({username: req.user.username}, {status: 'online'}, function (err, docs) {
                if (err) console.log(err);
            });
            if(req.query.newMember === 'true') {
                // new memeber
                res.render('main', {user: req.user, isNewMember: 1});
            } else {
                res.render('main', {user: req.user});
            }
        }
    );

    // Show Users
    router.get('/', loggedIn, function(req, res, next) {
        var sorts = req.query.sort;
        if(!sorts) {
            // Specify in the sort parameter the field or fields to sort by 
            // and a value of 1 or -1 to specify an ascending or descending sort respectively.
            sorts = {status: -1, username: 1};
        } else {
            var sortsList = sorts.split(',');
            sorts = {};
            for (var ele of sortsList) {
                var key = ele;
                var value = 1;
                if (ele[0] && (ele[0]==='+' || ele[0]==='-')) {
                    value = ele[0]==='+' ? 1 : -1;
                    key = key.substring(1);
                }
                if (key === 'username' || key === 'status') {
                    sorts[key] = value;
                } else {
                    return res.status(400).send({'name': 'IncorrectQueryValue', 'message': 'value of query parameter \'sort\' is incorrect'});
                }
            }
        }

        var offset = req.query.offset;
        if(offset && !offset.match(/^-{0,1}\d+$/) || offset.length == 0) {
            return res.status(400).send({'name': 'IncorrectQueryValue', 'message': 'value of query parameter \'offset\' is incorrect'});
        } else if(!offset) {
            offset = 0;
        } else {
            offset = parseInt(offset);
        }

        var count = req.query.count;
        if(count && !count.match(/^-{0,1}\d+$/) || count.length == 0) {
            return res.status(400).send({'name': 'IncorrectQueryValue', 'message': 'value of query parameter \'count\' is incorrect'});
        } else if(!count) {
            count = 25;
        } else {
            count = parseInt(count);
        }
        
        User.
        find({}).
        sort(sorts).
        skip(offset).
        limit(count).
        exec(function(err,alluser){
            //  var onlines=[];
            //  var offlines=[];
            if(err) {
                return res.status(400).send(err);
            }

            onlines=alluser.filter(function(user){
                return user.status === 'online'
            });
            offlines=alluser.filter(function(user){
                return user.status === 'offline'
            });
            onl_map = onlines.map(x => x.username);
            offl_map = offlines.map(x => x.username);
            //res.json(200, {online: onl_map, offline: offl_map});   ---> deprecated
            res.send({online: onl_map, offline: offl_map});
        });
    });


    // Post Login Info
    router.post('/', function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.status(401).send(info); }
            req.logIn(user, function(err) {
                if (err) { return res.send(info); }
                // When the parameter is an Array or Object, Express responds with the JSON representation
                //here: login success!
                User.update({username:req.user.username},{status:'online'}, function(err, docs){
                    // if(err) console.log(err);
                    if(err) {
                      return res.status(503).send(err);
                    }
                    //broadcastUserList(io);
                    res.send({'redirect': 'v1/users/' + req.user.username});
                });  
            });
        })(req, res, next);
    });


    // Put Register Info
    router.put('/:username', function(req, res, next) {
        if (!checkAvailability(req.params.username)) {
            return res.status(403).send({name: 'InvalidUsernameError', message: 'not a valid username'});
        }
        User.register(new User({
            username: req.path.substring(1),
            displayname: req.path.substring(1),
            status: 'online',
            rooms: ['000000000000']
        }), req.body.password, function(err, user) {
            if (err) {
                //return res.render('login', { title : 'login ESN' });
                return res.status(403).send(err);
            }
            return res.send({});
        });
    });

    return router;
};
