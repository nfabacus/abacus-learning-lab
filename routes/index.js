var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.user) {
    return res.redirect('/classroom-chat');
  } else {
    return res.render('index', { title: 'Abacus Learning Lab', user: req.user, anyArray: [10,20,'Hello'] });
  }

});

router.get('/about', function(req, res, next) {
  return res.render('about');
});

router.get('/classroom-chat', function(req, res, next) {
  if(req.user) {
    return res.render('classroom-chat', { user: req.user });
  } else {
    return res.redirect('/');
  }
});

router.get('/customer-chat', function(req, res, next){
  return res.render('customer-chat');
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/classroom-chat');
        });
    });
});

router.get('/login', function(req, res) {
    if(req.user) {
      return res.redirect('/classroom-chat');
    } else {
      return res.render('login', { user : req.user });
    }

});

router.post('/login', passport.authenticate('local'), function(req, res) {
    return res.redirect('/classroom-chat');
});

router.get('/logout', function(req, res) {
    req.logout();
    return res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

module.exports = router;
