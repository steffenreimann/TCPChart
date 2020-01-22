var express = require('express');
var app = express();
var httpServer = require("http").createServer(app);
var io = require('socket.io')(httpServer);
var btz = require('./btz_tcp_connector');
var utils = require('./utils.js');
var fs = require('fs');
const path = require('path');
const YAML = require('yaml')
//const file          = fs.readFileSync('./yaml/api/api.yml', 'utf8')
//var btzapi          = YAML.parse(file)
const { Readable } = require('stream'); 
httpServer.listen("8080");
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
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
        if (connected) {
            update_configs();
            dataStreamLog(function (err) {
                console.log(err)
            }, data.ip);
            // update_position();
        }
        var data = { error: null, connected: connected }
        routeConn(data);
    });
}


io.on('connection', function (socket) {

    routeConn({ error: '', connected: tcp_connected })

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
        var da = { error: "", connected: conn }
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

    socket.on('savelog', function () {
        savelog()
    });
    socket.on('loadlog', function (data) {
        console.log('loadlog');
        loadlog(data)
    });

    socket.on('sendByTemp', function (data) {
        console.log('sendByTemp');
        console.log(data);
        sendByTemp(data)
    });
});


function readAPI_JSON() {
    const file = fs.readFileSync('./yaml/api/api.yml', 'utf8')
    return YAML.parse(file);
}

function on_request(data) {
    //Check if data containing configurations
    if (data.category == "config" && data.data.mode == "r") {
        // These datas will be cached, thus not every client have to fetch these and produce a massive overhead
        if (data.command == "CFG_STEERING") {
            cache.cfg_steering = data;
        } else if (data.command == "CFG_DRIVE") {
            cache.cfg_drive = data;
        }
        console.log("Unkown config command:" + data.command);
        //return;
    }
    btz.SendRequest(data);
}



var DebugData_log = true;
var AllData_log = false;

//Daten gelangen über einen callback zu dieser function 
//Außerdem werden die daten 

/**
* on TCP Data
* @param {JSON} {JSON}
*   
*/
function on_btz_data(data) {
    //console.log(data);
    if (data.category == 'debug') {
        //Die Daten werden hier weiter an die socket.io clients verteilt.
        io.sockets.emit('onDebugData', data);
        if (DebugData_log && !AllData_log) {
            if(LogRsReady){
                //Außerdem werden Die Daten in einem readable stream übergeben.
                LogRstream.push(JSON.stringify(data));
                LogRstream.push(',');
            }
        }
    } 
    //Überprüft ob überhaupt gelogt werden soll
    if(AllData_log) {
        //Überprüft ob der readable stream ready ist
        if(LogRsReady){
            //Außerdem werden Die Daten in einem readable stream übergeben.
            LogRstream.push(JSON.stringify(data));
            LogRstream.push(',');
        }
    }
}

function on_btz_error(error, connected) {
    console.log(error);
    console.log("Connected = " + connected);
    var data = { error: error, connected: connected }
    routeConn(data)
}

function routeConn(data) {
    console.log(data);
    tcp_connected = data.connected
    io.sockets.emit('routeConnection', tcp_connected);
}




dataStreamLog

//Save TCP Data Stream to File
var LogWstream = ""
var LogRstream = ""
var LogWsReady = false
var LogRsReady = false

//Init tcp to file stream

/**
* Save TCP Data Stream to File
* @param {FunctionStringCallback} callback
*   
* @param {string} id
*   
*/
function dataStreamLog(callback, id) {
    console.log("dataStreamLog");
    var dir = path.join(__dirname, 'logs')
    
    //getDir gibt die Files im Ordner und die Anzahl der logfiles zurück
    utils.getDir(function (data) {
        console.log("data");
        console.log(data);

        //set tmp Path 
        var num = data.LogFiles + 1
        var fileName = num.toString() + id + '.json'
        var tmp_path = path.join(dir, 'log-' + fileName)


        LogWstream = fs.createWriteStream(tmp_path);
        LogRstream = new Readable({ read(){} });
        LogRstream.push('[');
        LogWsReady = true
        LogRsReady = true  

        LogRstream.on('data', function (data) {
            console.log("-------------------- DATA ---------------------");
            const isReady = LogWstream.write(data);
            if (!isReady) {
                //wird der Inputstream gestoppt
                LogRstream.pause();
                //ist der resultstream wieder aufnahmefähig 
                LogWstream.once('drain', function () {
                    //wird der inputstream gestartet
                    LogRstream.resume();
                });
            }
        });
        LogRstream.on('end', function () {
            LogWstream.end();
            console.log("--------------------end---------------------");
            callback(true)
            return true
        });
        LogRstream.on('error', function (err) {
            console.log('-- ERROR --');
            console.log(err);
            LogWstream.end();
            callback(err)
            return false
        })

        console.log(tmp_path);
    }, dir)
}

function savelog() {
    if(LogRsReady){
        console.log("end stream");
        LogRstream.push('{}');
        LogRstream.push(']');
        LogRstream.push(null);
        LogWsReady = false
        LogRsReady = false
    }
    io.sockets.emit('debug_sync', { category: 'log', data: 'saved' });
}

function loadlog(id) {
    var content;
    // First I want to read the file
    fs.readFile('./logs/log-' + id + '.json', function read(err, data) {
        if (err) {
            throw err;
        }
        // console.log(data); 
        try {
            content = JSON.parse(data);
            ok = true
        } catch (error) {
            console.log(error);
            console.log(data);
            ok = false
        }
        if(ok){
            console.log("json_object");
            content.forEach(element => {
                console.log(element);
                io.sockets.emit('onDebugData', data);
            });
        }
        // console.log(content);  
        
    });

}





function update_configs() {
    console.log("updata");
    //btz.Send({"device": "mobil", "category":"config","command":"CFG_STEERING_STATUS", "data":{"mode": "rf"}});
    //btz.Send({"device": "mobil", "category":"config","command":"CFG_DRIVE", "data":{"mode": "rf"}});
    //btz.Send({"category":"config","command":"CFG_READ","data":{"mode":"rf"},"device":"mobil"});
    //btz.Send({"category":"control","command":"ST_POSITION","data":{"mode":"rf"},"device":"mobil"});
    //btz.Send({"category":"config","command":"CFG_STEERING_STATUS","data":{"mode":"rf"},"device":"mobil"});
}
function update_position() {
    // btz.Send({"category":"control","command":"ST_POSITION", "data":{"mode": "rf", 'pos_mode': "real"}});
}

function get_template(category, command, mode) {

    if (category == "config") {
        var cate = btzapi.config;
    } else if (category == "control") {
        var cate = btzapi.control;
    }

    var keys = Object.keys(cate);
    if (keys.indexOf(command) == -1) {
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
    } else[
        data = { mode: mode }
    ]
    console.error("mode = ", mode);
    console.error("data = ", data);

    return { category: category, command: command, device: "mobil", data: data }
}

function get_cfg_object(calibspeed, pid, thresholds) {
    //var cmd = get_template("config", "CFG_READ", "rf");
    //cmd.data.calibspeed = calibspeed;
    //cmd.data.pid = pid;
    //cmd.data.thresholds = thresholds;
    //return cmd;
}

function sendByTemp(category, command, rf, data) {
    //var test_cmd = get_template(category, command, rf)
    console.log('sendByTemp data = ');
    //console.log(test_cmd);
    //var conn = btz.Send(test_cmd);
    //var da = {error: "", connected: conn}
    //routeConn(da);
    //var test_cmd = get_template("config", "CFG_READ", "rf")
}

var another_cmd = get_cfg_object(100, { p: 10.0, i: 12.3, d: 123.23 }, { t_d_max: 1, t_d_min: 1, t_s_max: 100, t_s_min: 50, t_s_pos: 1000 });
//console.log(test_cmd)  

btz.DataCallback(on_btz_data);

