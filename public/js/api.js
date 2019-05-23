
//json
function get_debug(data) {
    console.log(data);
    return data.debug
}
function dir(direction) {
    if(direction == "FOR"){
        return 1
    }else if(direction == "REV"){
        return 0
    }
    return 'error'
}
function dac(val, out) {
    if(out == "freq"){
        return parseInt(mapping(val, 0, 4095, 0, 60).toFixed(2));
    }else if(out == "volt") {
        return parseInt(mapping(val, 0, 4095, 0, 10).toFixed(2));
    }
}
function time(data) {
    var data_arr = data.split('T');
    var data_ar = data_arr[1].split('-');
    var hhmmss = data_ar[0];
    var hmm = hhmmss.split('.');
    console.log(hmm[0]);
    return hmm[0]
}
const mapping = (num, in_min, in_max, out_min, out_max) => {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}