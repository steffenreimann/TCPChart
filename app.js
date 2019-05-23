var express        	= require('express');
var app            	= express();
var httpServer		= require("http").createServer(app);
var io              = require('socket.io')(httpServer);
var btz             = require('./btz_tcp_connector');
var fs              = require('fs');
const path          = require('path');
const YAML          = require('yaml')
const file          = fs.readFileSync('./yaml/api/api.yml', 'utf8')
var btzapi          = YAML.parse(file)

httpServer.listen("8080");
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/debug.html');
});

console.log('HTTP Server Läuft unter http://localhost:8080');

var tcp_connected = false

btz.DataCallback(on_btz_data);
btz.ErrorCallback(on_btz_error);

 
function connectTCP(data) {
    console.log(data);
    btz.Connect(data.ip, data.port, function (connected) {
        console.log("TCP client is");
        console.log("Connected " + connected);
        tcp_connected = connected
        if(connected){
            update_configs();
           // update_position();
        }
        var data = {error: null, connected: connected}
        routeConn(data);
    });
}


io.on('connection', function (socket) {

    routeConn({error: '', connected: tcp_connected})

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
    socket.on('connectTCP', function (data) {
        console.log('connectTCP = ');
        console.log(data);
        connectTCP(data);
        //socket.broadcast.emit('connectTCP', data);

    });
    socket.on('btz', function (data) {
        console.log('btz data = ');
        console.log(data);
        socket.broadcast.emit('btz', data); 
    });
    socket.on('sendbtzcmd', function (data) {
        console.log('sendbtzcmd data = ');
        console.log(data);
        var conn = btz.Send(data);
        var da = {error: "", connected: conn}
        routeConn(da);
        //socket.emit('sendbtzcmd', data);
    });
    socket.on('readAPI', function () {
        var data = readAPI_JSON();
        console.log('readAPI = ');
        console.log(data);
        socket.emit('readAPI', data);
    });
    socket.on('test', function () {
        var data = readAPI_JSON();
        console.log('test readAPI = ');
        console.log(data);
        socket.emit('onData', data.debug);
    });
    
    socket.on('savelog', function(){
        savelog()
    });
    socket.on('loadlog', function(data){
        console.log('loadlog');
        loadlog(data)
    });

    socket.on('sendByTemp', function(data){
        console.log('sendByTemp');
        console.log(data);
        sendByTemp(data.category, data.command, data.rf)
    });



    
});


function readAPI_JSON() {
    const file = fs.readFileSync('./yaml/api/api.yml', 'utf8')
    return YAML.parse(file);
}
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
    btz.SendRequest(data);
}

var DebugData_log = false;
var ControlData_log = false;
var ConfigData_log = true;
var AllData_log = false;

function on_btz_data(data) {
    //console.log(data);
    if(data.category == 'debug'){
        //work(data);
        io.sockets.emit('onDebugData', data);
        if(DebugData_log && !AllData_log){
            work(data);
        }
    }else if(data.category == 'control'){
        io.sockets.emit('onControlData', data);
        if(ControlData_log && !AllData_log){
            work(data);
        }
    }else if(data.category == 'config'){
        io.sockets.emit('onConfigData', data);
        if(ConfigData_log && !AllData_log){
            work(data);
        }
    }
    if(AllData_log){
        work(data);
    }
//    routeConn(data)
}

function on_btz_error(error, connected) {
    console.log(error);
    console.log("Connected = " + connected);
    var data = {error: error, connected: connected}
    routeConn(data)
}

function routeConn(data) {
    console.log(data);
    tcp_connected = data.connected
    io.sockets.emit('routeConnection', tcp_connected);
}


var WEBcache = {current_position: '', dac_power: '', direction: '', enabled_motors: {steering: false, drive: false}, target_position: '', time: ''}
var WEBlog = [];
var log_lenght = 200
function work(data) {
    var len = WEBlog.length
    WEBcache = data
    WEBlog.push(WEBcache);
    if(len > log_lenght){
        console.log(len);
        for (var i = len - log_lenght; i > 0 ; i--) {
            WEBlog.pop();
        }
        
    }
  // console.log(WEBcache);
}

var logindex = 0
function savelog() {
    const directoryPath = path.join(__dirname, 'logs');
    console.log(directoryPath);
    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        logindex = files.length
        console.log('files lenght = ' + files.length)
    
        logindex++
        console.log('logindex = ' + logindex)
        fs.writeFile("logs/log-" + logindex + ".json", JSON.stringify(WEBlog), (err) => {
        logindex = 0
        if (err) console.log(err);
        console.log("Successfully Written to File.");
        });
        WEBlog = [];
    });
    io.sockets.emit('debug_sync', {category: 'log', data: 'saved'});
}

function loadlog(id){
    var content;
    // First I want to read the file
    fs.readFile('./logs/' + id, function read(err, data) {
        if (err) {
            throw err;
        }
       // console.log(data); 
        content = JSON.parse(data);
       // console.log(content);  
    content.forEach(element => {
       // console.log(element);
        io.sockets.emit('onData', element);
    });
    });
    
}


function update_configs(){
    console.log("updata");
    // btz.Send({"device": "mobil", "category":"config","command":"CFG_STEERING_STATUS", "data":{"mode": "rf"}});
    //btz.Send({"device": "mobil", "category":"config","command":"CFG_DRIVE", "data":{"mode": "rf"}});
    btz.Send({"category":"config","command":"CFG_READ","data":{"mode":"rf"},"device":"mobil"});
    btz.Send({"category":"control","command":"ST_POSITION","data":{"mode":"rf"},"device":"mobil"});
    //btz.Send({"category":"config","command":"CFG_STEERING_STATUS","data":{"mode":"rf"},"device":"mobil"});
} 
function update_position() {
    btz.Send({"category":"control","command":"ST_POSITION", "data":{"mode": "rf", 'pos_mode': "real"}});
}
function get_template(category, command, mode) {

    if(category == "config") {
        var cate = btzapi.config;
    } else if(category == "control") {
        var cate = btzapi.control;
    }

    var keys = Object.keys(cate);
    if(keys.indexOf(command) == -1) {
        console.error("command not found", command);
        return null;
    }

    var cmd = cate[command];
    if (cmd.mode.indexOf(mode) == -1) {
        console.error("mode not supported", mode);
        return null;
    }
    if (cmd.response != undefined) {
        var data = cmd.response;
        data["mode"] = mode;
    }else[
        data = {mode: mode}
    ]
    console.error("mode = ", mode);
    console.error("data = ", data);
    
    
    return {category: category, command: command, device: "mobil", data: data}

}
function get_cfg_object(calibspeed, pid, thresholds) {
    var cmd = get_template("config", "CFG_READ", "rf");
    cmd.data.calibspeed = calibspeed;
    cmd.data.pid = pid;
    cmd.data.thresholds = thresholds;
    return cmd;
}

function sendByTemp(category, command, rf, data) {
    var test_cmd = get_template(category, command, rf)
    console.log('sendByTemp data = ');
    console.log(test_cmd);
    var conn = btz.Send(test_cmd);
    var da = {error: "", connected: conn}
    routeConn(da);
    //var test_cmd = get_template("config", "CFG_READ", "rf")
}

var another_cmd = get_cfg_object(100, {p: 10.0, i: 12.3, d: 123.23},{t_d_max: 1, t_d_min: 1, t_s_max: 100, t_s_min: 50, t_s_pos: 1000});
//console.log(test_cmd)  

btz.DataCallback(on_btz_data);