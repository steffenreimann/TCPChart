/**
 * Created by jonas on 13.05.17.
 */
var net = require('net');

var server_address = "192.168.178.38";
var server_port = 55566;
var client = net.Socket();
var client_connected = false;
var data_callback = null;

var MSG_buffer = [];
var busy = false;
var counter = 0;

client.on('data', on_data);
client.on('error', on_error);

function connect_to_server(connected_callback){
    client.connect(server_port, server_address, function (data) {
        console.log(data);//data test 
        client_connected = true;
        connected_callback(client_connected);
        setInterval(() => {
            send_request();
        }, 10);
    });
}



function send(data) {
    MSG_buffer.push(data);
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

function on_data(data){
    console.log("ondata");
    if(data_callback == null){
        console.log("Data callback is null");
        return;
    }
    json_object = JSON.parse(data);
    data_callback(json_object);
}

function on_error(error){
    client_connected = false;
    console.log("Client error");
    console.log(error);
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
    ServerAddress: server_address,
    ServerPort: server_port,
    DataCallback: set_data_callback
};