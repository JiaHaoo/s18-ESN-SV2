var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'ESN' });
});

router.get('/login', function(req, res, next) {
	res.render('login', { title: 'login ESN'});
});

router.get('/signout', function(req, res, next) {
    res.render('home', { title: 'ESN' });
});

module.exports = router;
