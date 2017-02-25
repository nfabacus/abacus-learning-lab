module.exports = function(io) {
  var messages = [];
  var connections = [];

    io.on('connection', function(socket){
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
};
