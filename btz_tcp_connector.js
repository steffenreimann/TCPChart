/**
 * Created by jonas on 13.05.17.
 */
var net = require('net');

var server_address = "192.168.178.197";
var server_port = 55566;
var client = net.Socket();
var client_connected = false;
var data_callback = null;

client.on('data', on_data);
client.on('error', on_error);

function connect_to_server(connected_callback){
    client.connect(server_port, server_address, function (data) {
        console.log(data);//data test 
        client_connected = true;
        connected_callback(client_connected);
    });
}

function set_data_callback(callback){
    data_callback = callback;
}

function send_request(request) {
    client.write(JSON.stringify(request));
}

function on_data(data){
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
module.exports = {
    Connect: connect_to_server,
    SendRequest: send_request,
    ServerAddress: server_address,
    ServerPort: server_port,
    DataCallback: set_data_callback
};