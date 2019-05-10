var express        	= require('express');
var app            	= express();
var httpServer		= require("http").createServer(app);
var io              = require('socket.io')(httpServer);

httpServer.listen("8080");
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
console.log('HTTP Server Läuft unter http://localhost:8080');

io.on('connection', function (socket) {
    
    //socket.emit('news', { hello: 'noob' });
    
    socket.on('cmd', function (data) {
          console.log('SocketIO = ' + data.cmd);
    });
    socket.on('replay', function () {
          console.log('Replay...');
        
    });
    socket.on('sync', function (data) {
          console.log('sync = ');
          console.log(data);
          socket.broadcast.emit('sync', data);
          
    });
    socket.on('map', function (data) {
          console.log('sync map = ');
          console.log(data);
          socket.broadcast.emit('map', data);
         
    });
    socket.on('btz', function (data) {
          console.log('btz data = ');
          console.log(data);
          socket.broadcast.emit('btz', data);
          
    });
});









