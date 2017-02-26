module.exports = function(io) {
  var messages = [];
  var connections = [];
  var customerMessages = [];
  // var customerConnections = [];

    io.on('connection', function(socket){
      connections = connections.filter(function (data){
        return data !== socket;
      });
      connections.push(socket);
      console.log('connection: %s socket(s) connected',connections.length);

      // disconnect
      socket.on('disconnect', function(data){
        connections.splice(connections.indexOf(socket),1);
        console.log('Disconnected: %s socket(s) connected', connections.length);
      });

      // Send messages to client
      if(messages.length) {
        io.sockets.emit('new message', messages);
      }
      if(customerMessages.length) {
        io.sockets.emit('message from abacus', customerMessages);
      }

      // Receive messages from Client
      socket.on('send message', function(data){
        var messageObj = {username:data.sender, msg: data.message};
        messages.push(messageObj);
        io.sockets.emit('new message', messageObj);
      });

      socket.on('message to abacus', function(data){
        console.log('message received from client: ', data);
        var messageObj = {username:data.sender, msg: data.message};
        customerMessages.push(messageObj);
        io.sockets.emit('message from abacus', messageObj);
      });

    });
};
