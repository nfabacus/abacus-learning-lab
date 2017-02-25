var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();

var messages = [];
var connections = [];
var isConnected = false;
var connectedUser = "";

function registerSocketIo(req){
  var io = req.app.get('socketio');
  console.log("req.user: ", req.user.username);
  io.on('connection', function(socket){
    socket.user = req.user;
    console.log(socket.user.username + ' is connected.');
    connections = connections.filter(function (data){
      return data !== socket;
    });
    connections.push(socket);
    if(messages.length) {
      io.sockets.emit('new message', messages);
    }
    console.log('connection: %s socket(s) connected',connections.length);

    // disconnect
    socket.on('disconnect', function(data){
      connections.splice(connections.indexOf(socket),1);
      console.log('Disconnected: %s socket(s) connected', connections.length);
    });

    // Send Message
    socket.on('send message', function(data){
      var messageObj = {username:data.sender, msg: data.message};
      messages.push(messageObj);
      io.sockets.emit('new message', messageObj);
    });
  });
}
/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.user) {
    return res.redirect('/dashboard');
  } else {
    return res.render('index', { title: 'Abacus Learning Lab', user: req.user, anyArray: [10,20,'Hello'] });
  }

});

router.get('/about', function(req, res, next) {
  return res.render('about');
});

router.get('/dashboard', function(req, res, next) {

  console.log('I am at the dashboard');
  if(req.user) {
    console.log('username before socket: ', req.user);
    if(!isConnected && connectedUser !== req.user){
      console.log('user to be connected: ', req.user);
      connectedUser = req.user;
      registerSocketIo(req);
      isConnected = true;
    }
    return res.render('dashboard', { user: req.user });
  } else {
    return res.redirect('/');
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
    return res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    return res.redirect('/dashboard');
});

router.get('/logout', function(req, res) {
    req.logout();
    return res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

module.exports = router;
