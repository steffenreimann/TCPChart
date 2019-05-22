socket = io.connect();
//socket.emit('readAPI');
//socket.emit('test');
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
    console.log("routeConnection Daten vom Server onData = ");
    console.log(data);
    client_connected = data;
    if(!client_connected){
        set_led('tcp', 'red');
        
    }
    if(client_connected){
        set_led('tcp', 'green');
        
    }
});

socket.on('onData', function (data) {
    console.log("Daten vom Server onData = ");
    console.log(data);
    //set_led('test', 'green');
    if (!Array.isArray(data)) {
        //console.log(Array.isArray(data));
        data.value = [data.value]
        ///console.log(Array.isArray(data));
    }
    if(data.category == 'debug'){
        //console.log('debug ');
        //console.log(data.value);
        data.value.forEach(element => {
            //console.log(element);
            //debug_data.push(element);
            //cfg.data.datasets.data = debug_data;
            var timee = Date.now();
            addData(chart, "Lenkung Ist", {y: element.current_position, x: timee})
            addData(chart, "Lenkung Soll", {y: element.target_position, x: timee})
            addData(chart, "ADC Power", {y: dac(element.dac_power, 'volt'), x: timee})
            addData(chart, "Drehrichtung", {y: dir(element.direction), x: timee})
            addData(chart, "Lenkung Freigabe", {y: element.enabled_motors.steering, x: timee})
            addData(chart, "Motor Freigabe", {y: element.enabled_motors.drive, x: timee})
            chart.data.labels.push(element.time);
            //setMotor(0, element.enabled_motors.steering)
           // setMotor(1, element.enabled_motors.drive)
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
    });
    //console.log("dataset");
    removeData(chart);
    chart.update();
}

var chart_max_length = 50;
function removeData(chart) {
    //chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        var len = dataset.data.length
        if(len > chart_max_length){
            console.log(len);
            for (var i = len - chart_max_length; i > 0 ; i--) {
                dataset.data.shift();
            }
        }
    });
   // chart.update();
}

var isRunning = false
function ChartPause() {
    if(!isRunning){
        isRunning = true
        $("#play").html("play_arrow");
    }else{
        isRunning = false
        $("#play").html("pause");
    }
    cfg.options.scales.xAxes[0].realtime.pause = isRunning;
    chart.update({duration: 0});
}

function set_fps() {
    var fps = parseInt(get_val('CMDLine'));
    console.log(fps);
    cfg.options.plugins.streaming.frameRate = fps;
    chart.update({duration: 0});
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
function toggleMotor(MotorID, send) {
    if(runningMotors[MotorID]){
        runningMotors[MotorID] = false;
        var data = {isCMD: true, cmd: [{cmd: '', obj:{"category":"control","command": selectMotor(MotorID),"data":{"mode":"s", "name": "drive", "state": false},"device":"mobil"}}]}
        if(send){
            run(data)
        }
        set_led('motor' + MotorID, 'blue');
    }else{
        var data = {isCMD: true, cmd: [{cmd: '', obj:{"category":"control","command": selectMotor(MotorID),"data":{"mode":"s", "name": "drive", "state": true},"device":"mobil"}}]}
        if(send){
            run(data)
        }
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

function setMotor(MotorID, data) {
    console.log("lol" + data);
    if (data) {
        runningMotors[MotorID] = true
        set_led('motor' + MotorID, 'yellow');
    }else{
        runningMotors[MotorID] = false
        set_led('motor' + MotorID, 'blue');
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
                type: 'realtime',
				realtime: {
					duration: 20000,
					ttl: 60000,
					refresh: 50,
					delay: 100,
					pause: false,
					onRefresh: addData
				},
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
        },
        tooltips: {
			mode: 'nearest',
			intersect: false
		},
		hover: {
			mode: 'nearest',
			intersect: false
		},
		plugins: {
			streaming: {
				frameRate: 60
            },
            zoom: {
                // Container for pan options
                pan: {
                    // Boolean to enable panning
                    enabled: true,
        
                    // Panning directions. Remove the appropriate direction to disable
                    // Eg. 'y' would only allow panning in the y direction
                    mode: 'x',
                    rangeMin: {
                        // Format of min pan range depends on scale type
                        x: null,
                        y: null
                    },
                    rangeMax: {
                        // Format of max pan range depends on scale type
                        x: null,
                        y: null
                    },
                    // Function called once panning is completed
                    // Useful for dynamic data loading
                    onPan: function({chart}) { console.log(`I was panned!!!`); }
                },
        
                // Container for zoom options
                zoom: {
                    // Boolean to enable zooming
                    enabled: true,
        
                    // Enable drag-to-zoom behavior
                    drag: false,
        
                    // Drag-to-zoom rectangle style can be customized
                    // drag: {
                    // 	 borderColor: 'rgba(225,225,225,0.3)'
                    // 	 borderWidth: 5,
                    // 	 backgroundColor: 'rgb(225,225,225)'
                    // },
        
                    // Zooming directions. Remove the appropriate direction to disable
                    // Eg. 'y' would only allow zooming in the y direction
                    mode: 'x',
        
                    rangeMin: {
                        // Format of min zoom range depends on scale type
                        x: null,
                        y: null
                    },
                    rangeMax: {
                        // Format of max zoom range depends on scale type
                        x: null,
                        y: null
                    },
        
                    // Speed of zoom via mouse wheel
                    // (percentage of zoom on a wheel event)
                    speed: 0.1,
        
                    // Function called once zooming is completed
                    // Useful for dynamic data loading
                    onZoom: function({chart}) { console.log(`I was zoomed!!!`); }
                }
            }
		}
    }
};
var chart = new Chart(ctx, cfg);
