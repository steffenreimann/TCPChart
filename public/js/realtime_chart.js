var isIE = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.userAgent.indexOf('Trident') !== -1;

var chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

function randomScalingFactor() {
	return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
}

function onRefresh(chart) {
	chart.config.data.datasets.forEach(function(dataset) {
		dataset.data.push({
			x: Date.now(),
			y: randomScalingFactor()
		});
	});
}

var color = Chart.helpers.color;
var config = {
	type: 'line',
	data: {
		datasets: [{
			label: 'Dataset 1 (linear interpolation)',
			backgroundColor: color(chartColors.red).alpha(0.5).rgbString(),
			borderColor: chartColors.red,
			fill: false,
			lineTension: 0,
			borderDash: [8, 4],
			data: []
		}, {
			label: 'Dataset 2 (cubic interpolation)',
			backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
			borderColor: chartColors.blue,
			fill: false,
			cubicInterpolationMode: 'monotone',
			data: []
		}]
	},
	options: {
		title: {
			display: true,
			text: 'Interactions sample'
		},
		scales: {
			xAxes: [{
				type: 'realtime',
				realtime: {
					duration: 20000,
					ttl: 60000,
					refresh: 1000,
					delay: 2000,
					pause: false,
					onRefresh: onRefresh
				}
			}],
			yAxes: [{
				type: 'linear',
				display: true,
				scaleLabel: {
					display: true,
					labelString: 'value'
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
				frameRate: 30
			}
		}
	}
};

window.onload = function() {
	var ctx = document.getElementById('myChart').getContext('2d');
	window.myChart = new Chart(ctx, config);
};

document.getElementById('randomizeData').on('click', function() {
	config.data.datasets.forEach(function(dataset) {
		dataset.data.forEach(function(dataObj) {
			dataObj.y = randomScalingFactor();
		});
	});

	window.myChart.update();
});

var colorNames = Object.keys(chartColors);
document.getElementById('addDataset').on('click', function() {
	var colorName = colorNames[config.data.datasets.length % colorNames.length];
	var newColor = chartColors[colorName];
	var newDataset = {
		label: 'Dataset ' + (config.data.datasets.length + 1),
		backgroundColor: color(newColor).alpha(0.5).rgbString(),
		borderColor: newColor,
		fill: false,
		lineTension: 0,
		data: []
	};

	config.data.datasets.push(newDataset);
	window.myChart.update();
});

document.getElementById('removeDataset').on('click', function() {
	config.data.datasets.pop();
	window.myChart.update();
});

document.getElementById('addData').on('click', function() {
	onRefresh(window.myChart);
	window.myChart.update();
});

document.getElementById('duration').on(isIE ? 'change' : 'input', function() {
	config.options.scales.xAxes[0].realtime.duration = +this.value;
	window.myChart.update({duration: 0});
	document.getElementById('durationValue').innerHTML = this.value;
});

document.getElementById('ttl').on(isIE ? 'change' : 'input', function() {
	config.options.scales.xAxes[0].realtime.ttl = +this.value;
	window.myChart.update({duration: 0});
	document.getElementById('ttlValue').innerHTML = this.value;
});

document.getElementById('refresh').on(isIE ? 'change' : 'input', function() {
	config.options.scales.xAxes[0].realtime.refresh = +this.value;
	window.myChart.update({duration: 0});
	document.getElementById('refreshValue').innerHTML = this.value;
});

document.getElementById('delay').on(isIE ? 'change' : 'input', function() {
	config.options.scales.xAxes[0].realtime.delay = +this.value;
	window.myChart.update({duration: 0});
	document.getElementById('delayValue').innerHTML = this.value;
});

document.getElementById('frameRate').on(isIE ? 'change' : 'input', function() {
	config.options.plugins.streaming.frameRate = +this.value;
	window.myChart.update({duration: 0});
	document.getElementById('frameRateValue').innerHTML = this.value;
});

document.getElementById('pause').on('change', function() {
	config.options.scales.xAxes[0].realtime.pause = this.checked;
	window.myChart.update({duration: 0});
	document.getElementById('pauseValue').innerHTML = this.checked;
});