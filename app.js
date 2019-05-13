var express        	= require('express');
var app            	= express();
var httpServer		= require("http").createServer(app);
var io              = require('socket.io')(httpServer);
var btz_connector = require('./btz_tcp_connector');
var position_status_timer = null;

var cache = {
    cfg_steering: null,
    cfg_drive: null,
    cfg_st_calib_pos: null
};

btz_connector.Connect(function (connected) {
    console.log("TCP client is:");
    console.log(connected);
    if(connected){
        update_configs();
    }
});



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
    socket.on('sendbtzcmd', function (data) {
      console.log('sendbtzcmd data = ');
      console.log(data);
      btz_connector.SendRequest(data);
      socket.emit('sendbtzcmd', data);
      
});

    
});


function on_request(data){
      //Check if data containing configurations
      if(data.category == "config" && data.data.mode == "r"){
          // These datas will be cached, thus not every client have to fetch these and produce a massive overhead
          if(data.command == "CFG_STEERING"){
              cache.cfg_steering = data;
          }else if(data.command == "CFG_DRIVE"){
              cache.cfg_drive = data;
          }
          console.log("Unkown config command:" + data.command);
          //return;
      }
      btz_connector.SendRequest(data);
  }
  
function on_btz_data(data) {
      console.log(data);
      //io.sockets.emit('data', data);
}
  


  function update_configs(){
      btz_connector.SendRequest({"device": "all", "category":"config","command":"CFG_STEERING_STATUS", "data":{"mode": "r"}});
      setTimeout(function () {
          //btz_connector.SendRequest({"device": "all", "category":"config","command":"CFG_DRIVE", "data":{"mode": "r"}});
      },200);
  }
  
  function update_position() {
      btz_connector.SendRequest({"category":"control","command":"ST_POSITION", "data":{"mode": "r", 'pos_mode': "real"}});
  }
  
  btz_connector.DataCallback(on_btz_data);









