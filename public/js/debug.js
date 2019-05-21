socket = io.connect();
socket.emit('readAPI');
socket.emit('test');
//socket.emit('sendbtzcmd', 'test');

var debug_data = [];
var client_connected = false;
initCLI('CMDLine');

socket.on('sendbtzcmd', function (data) {
    console.log("Daten vom Server = ");
    console.log(data);
    if(data.category == 'debug'){
        console.log();
    }
});

socket.on('readAPI', function (data) {
    console.log("Daten vom Server readAPI = ");
    console.log(data);
    console.log(get_debug(data));
    console.log("DIR FOR = " + dir("FOR"));
    console.log("DIR FOR = " + dir("REV"));
});

socket.on('connect', function () {
    set_led('socketio', 'green');
});
socket.on('debug_sync', function (data) {
    if(data.category == 'log'){
        savelog(false);
    }
});

socket.on('disconnect', () => {
    set_led('socketio', 'red');
    set_led('tcp', 'red');
});
socket.on('routeConnection', function (data) {
    //console.log("routeConnection Daten vom Server onData = ");
    //console.log(data);
    client_connected = data.connected;
    if(!data.connected){
        set_led('tcp', 'red');
    }
    if(data.connected){
        set_led('tcp', 'green');
    }
});

socket.on('onData', function (data) {
   // console.log("Daten vom Server onData = ");
    //console.log(data);
    //set_led('test', 'green');
    if (!Array.isArray(data)) {
        //console.log(Array.isArray(data));
        data.value = [data.value]
        ///console.log(Array.isArray(data));
    }
    if(data.debug.category == 'debug'){
        //console.log('debug ');
        //console.log(data.value);
        data.debug.steering_pid.response.forEach(element => {
            //console.log(element);
            //debug_data.push(element);
            //cfg.data.datasets.data = debug_data;
            //var timee = time(element.time);
            addData(chart, "Lenkung Ist", {y: element.current_position, x: element.time})
            addData(chart, "Lenkung Soll", {y: element.target_position, x: element.time})
            addData(chart, "ADC Power", {y: dac(element.dac_power, 'volt'), x: element.time})
            addData(chart, "Drehrichtung", {y: dir(element.direction), x: element.time})
            addData(chart, "Lenkung Freigabe", {y: element.enabled_motors.steering, x: element.time})
            addData(chart, "Motor Freigabe", {y: element.enabled_motors.drive, x: element.time})
            chart.data.labels.push(element.time);
            //console.log("debug ----------");
        });
        
    }
});

function addAllData(data) {
    chart.data.datasets.forEach((dataset) => {
        if(dataset){

        }
    });
}

function addData(chart, label, data) {
    chart.data.datasets.forEach((dataset) => {
        if (dataset.label == label) {
            //console.log(dataset);
            dataset.data.push(data);
        }
        if(chart.data.datasets.length == 4){
            //removeData(chart)
            //chart.data.labels.shift();
           // dataset.data.shift();
        }  
    });
    chart.update();
}
function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}

var runningSave = false;
function savelog(save) {
    if (save) {
        if (runningSave) {
            //runningSave = false
            set_led('savelog', 'red');
            return 'run'
        }else{
            set_led('savelog', 'yellow');
            runningSave = true
            socket.emit('savelog');
        }
    }else{
        if (runningSave) {
            set_led('savelog', 'blue');
            runningSave = false
        }
    }
    
    
}

function loadlog(){
    set_led('loadlog', 'yellow');
    var str = get_val('CMDLine');
    console.log(str);
    if(str == ''){
        str = 'test-log.json'
    }
    socket.emit('loadlog', str);
    console.log(str);
}
 function clearchart() {
    removeData(chart)
    //chart.clear();
 }

 function toggleFullscreen() {
    let elem = document.querySelector("body");
  
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  }

var runningMeasurement = false;
function toggleMeasurement() {
    if(runningMeasurement){
        runningMeasurement = false;
        var data = {isCMD: true, cmd: [{cmd: '', obj:{"category":"debug","command":"DEBUG_STEERING","data":{"mode":"s", "name": "subcriber", "state": false},"device":"mobil"}},
                                        {cmd: '', obj:{"category":"debug","command":"DEBUG_ENABLE","data":{"mode":"s", "name": "subcriber", "state": false},"device":"mobil"}},
                                        {cmd: '', obj:{"category":"debug","command":"START_STEERING_DEBUG","data":{"mode":"s", "name": "subcriber", "state": false},"device":"mobil"}}]}
        run(data)
        set_led('start', 'blue');
    }else{
        var data = {isCMD: true, cmd: [{cmd: '', obj:{"category":"debug","command":"DEBUG_STEERING","data":{"mode":"s", "name": "subcriber", "state": true},"device":"mobil"}},
                                        {cmd: '', obj:{"category":"debug","command":"DEBUG_ENABLE","data":{"mode":"s", "name": "subcriber", "state": true},"device":"mobil"}},
                                        {cmd: '', obj:{"category":"debug","command":"START_STEERING_DEBUG","data":{"mode":"s", "name": "subcriber", "state": true},"device":"mobil"}}]}
        run(data)
        runningMeasurement = true;
        set_led('start', 'yellow');
    }
}

var runningMotors = [false, false]
function toggleMotor(MotorID) {
    if(runningMotors[MotorID]){
        runningMotors[MotorID] = false;
        var data = {isCMD: true, cmd: [{cmd: '', obj:{"category":"control","command": selectMotor(MotorID),"data":{"mode":"s", "name": "drive", "state": false},"device":"mobil"}}]}
        run(data)
        set_led('motor' + MotorID, 'blue');
    }else{
        var data = {isCMD: true, cmd: [{cmd: '', obj:{"category":"control","command": selectMotor(MotorID),"data":{"mode":"s", "name": "drive", "state": true},"device":"mobil"}}]}
        run(data)
        runningMotors[MotorID] = true;
        set_led('motor' + MotorID, 'yellow');
    }
}

function selectMotor(MotorID) {
   if (MotorID == 0 ) {
       return 'ENABLE_CTRL'
   }else if (MotorID == 1) {
       return 'ENABLE_CTRL'
   }
}




function connectTCP() {
    console.log('Funcion connectTCP')
    var ip = ''
    var port = ''
    if(client_connected){
        set_led('tcp', 'red');
        console.log("Client Connected ... new conn ");
    }
    var str = get_val('CMDLine');
    if(str == ''){
        ip = ''
        port = ''
    }else{
        var str_split = str.split(':');
        ip = str_split[0]
        port = str_split[1]
    }
    if(port == undefined){
        port = ''
    }
    console.log(ip + ':' + port)
    socket.emit('connectTCP', {ip: ip, port: port});
}
function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
function randomBar(date, lastClose) {
    var open = randomNumber(lastClose * 0.95, lastClose * 1.05).toFixed(2);
    var close = randomNumber(open * 0.95, open * 1.05).toFixed(2);
    return {
        t: date.valueOf(),
        y: close
    };
}
var dateFormat = 'MM DD YYYY';
var date = moment('01 01 2019', dateFormat);
var data = [randomBar(date, 30)];
while (data.length < 60) {
    date = date.clone().add(1, 'd');
    if (date.isoWeekday() <= 5) {
        data.push(randomBar(date, data[data.length - 1].y));
        console.log("puish");
    }
}
var ctx = document.getElementById('myChart').getContext('2d');
ctx.canvas.width = 1000;
ctx.canvas.height = 300;
var color = Chart.helpers.color;
var cfg = {
    type: 'line',
    data: {
      datasets: [{
        label: 'ADC Power',
        yAxisID: 'A',
        borderColor: "#8e5ea2",
        fill: false,
        data: []
      }, {
        label: 'Lenkung Soll',
        yAxisID: 'B',
        borderColor: "#3cba9f",
        fill: false,
        data: []
      },{
        label: 'Lenkung Ist',
        yAxisID: 'C',
        borderColor: "#e8c3b9",
        fill: false,
        data: []
      },{
        label: 'Drehrichtung',
        yAxisID: 'D',
        steppedLine: 'before',
        borderColor: "#c45850",
        fill: false,
        data: []
      },{
        label: 'Lenkung Freigabe',
        yAxisID: 'E',
        steppedLine: 'before',
        borderColor: "#c45850",
        fill: false,
        data: []
      },{
        label: 'Motor Freigabe',
        yAxisID: 'F',
        steppedLine: 'before',
        borderColor: "#c45850",
        fill: false,
        data: []
      }]
    },
    options: {
        responsive: true,
        legend: {
            position: 'bottom'
        },
        scales: {
            xAxes: [{
                
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: ''
                },
                ticks: {
                    major: {
                        fontStyle: 'bold',
                        fontColor: '#FF0000'
                    }
                }
            }],
            yAxes: [{
            id: 'A',
            type: 'linear',
            position: 'left',
            }, {
            id: 'B',
            type: 'linear',
            position: 'left'
            }, {
                id: 'C',
                type: 'linear',
                position: 'left'
            }, {
                id: 'D',
                type: 'linear',
                position: 'right',
                ticks: {
                    beginAtZero: true,
                    stepSize: 1
                }
            }, {
                id: 'E',
                type: 'linear',
                position: 'right',
                ticks: {
                    beginAtZero: true,
                    stepSize: 1
                }
            }, {
                id: 'F',
                type: 'linear',
                position: 'right',
                ticks: {
                    beginAtZero: true,
                    stepSize: 1
                }
            }]
        }
    }
};
var chart = new Chart(ctx, cfg);
