module.exports = function(server){
  var io = require('socket.io')(server);
  var socket;
  io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('sendChat',function(data){

      io.emit('getChat',data);
    })
    socket.on('MessageLoad',function(data1){
      io.emit('MessageLoad1',data1);
    });
    socket.on('updateGroup',function(data){
      io.emit('updateGroup',data);
    });



  });
}
