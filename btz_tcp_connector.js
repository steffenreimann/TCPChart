/**
 * Created by jonas on 13.05.17.
 */
var net = require('net');
var btz_server_ip = "192.168.178.38";
var btz_server_port = 55566;
var client = net.Socket();
var client_connected = false;
var data_callback = null;
var error_callback = null;

var MSG_buffer = [];
var busy = false;
var counter = 0;

client.on('data', on_data);
client.on('error', on_error);
client.on('close', function(error) {
    console.log('Connection closed');
    client_connected = false;
    error_callback(error, client_connected);
});

function connect_to_server(server_ip, server_port, connected_callback){
    if(client_connected){
        disconnect();
    }
    if(server_ip == null || server_ip == ''){
        console.log("btz_server_ip = ");
        console.log(btz_server_ip);
        server_ip = btz_server_ip
    }
    if(server_port == null || server_port == ''){
        console.log("btz_server_port = ");
        console.log(btz_server_port);
        server_port = btz_server_port
    }

    client.connect(server_port, server_ip, function (data) {
        console.log(data);//data test 
        client_connected = true;
        connected_callback(client_connected);
        setInterval(() => {
            send_request();
        }, 10);
    });
    if(client_connected == false){
        connected_callback(client_connected);
    }
}

function send(data) {
    MSG_buffer.push(data);
    return client_connected
}
function send_request() {
    if(busy){
        return
    }
    if (MSG_buffer.length == 0) {
        return
    }
    var MSG_buffer_copy = MSG_buffer
    MSG_buffer = [];
    busy = true;
    var i = 0;
    var inter = setInterval(function () {
        console.log('timeout completed'); 
        console.log("MSG ---- " + i);
        var string = JSON.stringify(MSG_buffer_copy[i])
        console.log(string);
        client.write(string);
        i++;
        if(i == MSG_buffer_copy.length){
            busy = false;
            counter += i;
            console.log("MSG counter ---- " + counter);
            clearInterval(inter);            
        }
    }, 500); 
}


function set_data_callback(callback){
    data_callback = callback;
}
function set_error_callback(callback){
    error_callback = callback;
}

function on_data(data){

    //console.log(data.toString('utf8'));
    //console.log(data);
    buffer(data.toString('utf8'))
}


function buffer(data) {
        console.log("ondata");
        //console.log(data);
        if(data_callback == null){
            //console.log("Data callback is null");
            return;
        }
        var ok = false
        try {
            json_object = JSON.parse(data);
            ok = true
        } catch (error) {
            console.log(error);
            console.log(data);
            ok = false
        }
        if(ok){
            console.log("json_object");
            data_callback(json_object);
        }
}


function on_error(error){
    client_connected = false;
   // console.log("Client error");
   // console.log(error);
    error_callback(error, client_connected);
}

function disconnect() {
    client.destroy();
    client_connected = false;
    error_callback('disconnect by user', client_connected);
}

function isDebug(data) {
    if (data.category == "debug") {
        return true
    }
    return false 
}

module.exports = {
    Connect: connect_to_server,
    Send: send,
    ServerAddress: btz_server_ip,
    ServerPort: btz_server_port,
    DataCallback: set_data_callback,
    ErrorCallback: set_error_callback
};