socket = io.connect();
socket.emit('readAPI');
socket.emit('test');
var debug_data = [];
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

socket.on('onData', function (data) {
    console.log("Daten vom Server onData = ");
    console.log(data);
    if(data.category == 'debug'){
        data.response.forEach(element => {
            console.log(element.time);
            //debug_data.push(element);
            //cfg.data.datasets.data = debug_data;
            var timee = time(element.time);
            addData(chart, "Lenkung Ist", {y: element.current_position, x: timee})
            addData(chart, "Lenkung Soll", {y: element.target_position, x: timee})
            addData(chart, "ADC Power", {y: dac(element.dac_power, 'volt'), x: timee})
            addData(chart, "Drehrichtung", {y: dir(element.direction), x: timee})
            chart.data.labels.push(timee);
            console.log("debug ----------");
        });
        
    }
});

function addData(chart, label, data) {
    chart.data.datasets.forEach((dataset) => {
        if (dataset.label == label) {
            console.log(dataset);
            dataset.data.push(data);
        }
        if(chart.data.datasets.length == 4){
            //chart.data.labels.shift();
           // dataset.data.shift();
        }
        chart.update();
    });
}
function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
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
      },]
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
                position: 'right'
            }, {
                id: 'D',
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
