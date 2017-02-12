var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var userSender = "";
var messages = [];
function registerSocketIo(req){
  var users = [];
  var connections = [];
  var io = req.app.get('socketio');

  io.on('connection', function(socket){
    // console.log('this is the socket', socket);
    if(connections.length) {
      connections = connections.filter(function (data){
        return socket != data;

      })
    }
    connections.push(socket);
    if(messages.length) {
      io.sockets.emit('new message', messages);
    }
    console.log('connected: %s socket(s) connected',connections.length);

    // disconnect
    socket.on('disconnect', function(data){
      console.log('I was disconneted', data + 'I am the socket', socket.socket);
      connections.splice(connections.indexOf(socket),1);
      // console.log(socket);
      console.log('Disconnected: %s socket(s) connected', connections.length);
    });

    // Send Message
    socket.on('send message', function(data){
      var messageObj = {username:data.sender, msg: data.message}
      messages.push(messageObj);
      io.sockets.emit('new message', messageObj);
    });
  });
}
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Abacus Learning Lab', user: req.user, anyArray: [10,20,'Hello'] });
  if (req.user) res.redirect('/dashboard');
});

router.get('/about', function(req, res, next) {
  res.render('about');
});
var account = 0;
router.get('/dashboard', function(req, res, next) {

  console.log('I am at the dashboard');
  if(req.user) {
    userSender = req.user.username;
    // now use socket.io in your routes file
    if(account===0){
      registerSocketIo(req);
    }
    account++;



    res.render('dashboard', { user: req.user });
  } else {
    res.redirect('/');
  }

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
            res.redirect('/dashboard');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/dashboard');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

module.exports = router;
