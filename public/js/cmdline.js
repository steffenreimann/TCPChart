/**
 * Created by Steffen Reimann on 16.05.19
 */

var cmdarr = [{cmd: '!lol', obj:{"category":"config","command":"CFG_READ","data":{"mode":"rf"},"device":"mobil"}},
    {cmd: '!update', obj:{"category":"config","command":"CFG_READ","data":{"mode":"rf"},"device":"mobil"}}
]

var finalCMDs = [{cmd: '!update', obj:{"category":"config","command":"CFG_READ","data":{"mode":"rf"},"device":"mobil"}}, 
    {cmd: '!jamoin', obj:{"category":"config","command":"CFG_READ","data":{"mode":"rf"},"device":"mobil"}},
    {cmd: '!test', obj:{"category":"config","command":"CFG_READ","data":{"mode":"rf"},"device":"mobil"}},
    {cmd: '!test1', obj:{"category":"config","command":"CFG_READ","data":{"mode":"rf"},"device":"mobil"}},
    {cmd: '!test2', obj:{"category":"config","command":"CFG_READ","data":{"mode":"rf"},"device":"mobil"}}
]

function initCLI(id) {
    var CMDLineHistory = [];
    var CMDLineHistoryCounter = 0;

    var element = document.getElementById(id)
    element.addEventListener ('keydown', function (e) {
        console.log(event.which)
        if (event.which == 13) {
            //var str = document.getElementById(id)
            var str = $("#" + id).val();
            console.log(str)
            var out = filter(str, cmdarr)
            console.log(out)
            out.cmd = JSON.parse(out.cmd);
            run(out);
            $("#" + id).val("")
            
            if(str != "" && CMDLineHistory[CMDLineHistoryCounter] != str){
                CMDLineHistory.push(str)
                CMDLineHistoryCounter = CMDLineHistoryCounter + 1
            }
            
        }
        if (e.keyCode == 9) {
            e.preventDefault(); 
            var str = $("#" + id).val();
            var temp_arr = finalCMDs.concat(CMDLineHistory)
            //console.log(temp_arr);
            var out = filterTab(str, CMDLineHistory)
            console.log(out);
            $("#" + id).val(out.cmd);
        }
        if(e.keyCode == 40){
            if(CMDLineHistoryCounter + 1 <= CMDLineHistory.length){
                CMDLineHistoryCounter = CMDLineHistoryCounter + 1   
            }  
            $("#" + id).val(CMDLineHistory[CMDLineHistoryCounter])
        }
        if(e.keyCode == 38) {
            if(CMDLineHistoryCounter - 1 >= 0){
                CMDLineHistoryCounter = CMDLineHistoryCounter - 1   
            }
            $("#" + id).val(CMDLineHistory[CMDLineHistoryCounter])  
        }
    });
}

function get_val(id) {
    return $("#" + id).val();
}

//zufiltender string ob es ein cmd enthält  
//array von objs wo der cmd und data zum abgleichen drin sind
//return ist ein array aus allen cmds die gefunden wurden
function filter(str, arr) {
    var strarr = str.split(' ');
    var out = {isCMD: false, cmd: []}
    strarr.forEach(element1 => {
        arr.forEach(element2 => {
            if(element1 == element2.cmd){
                out.isCMD = true;
                out.cmd.push(element2);
            }
        });
    });
    if(!out.isCMD){
        out.cmd = str;
    }
    return out
}

var last = '';
var firstArr = '';
var first = true
function filterTab(str, arr) {
    var strarr = str.split('');
    var out = {isCMD: false, cmd: []}
    var trueInt = 0;
    var point = 0;
    
    for (let index1 = 0; index1 < arr.length; index1++) {
            var d = arr[index1]
            console.log(d);
            var b = d.split('');
            console.log(b);
            point = index1;

            for (let index = 0; index < strarr.length; index++) {

                console.log('strarr =')
                console.log(strarr[index])
                console.log('b =')
                console.log(b[index])
                console.log('index =')
                console.log(index)

                if (strarr[index] == b[index]) {
                    trueInt++
                    console.log('trueInt = ')
                    console.log(trueInt)
                }
            }
            if(strarr.length == trueInt ){
                out.cmd = arr[point];
                last = arr.length;
                trueInt = 0;
                first = false;
                return out
            }else if(last > arr.length){
                trueInt = 0;
            }
        };
    return out
}

//console.log(filterCMD("!lol", cmdarr));
//cmds = Obj or Array of Objs
function run(data) {
    if(data.isCMD){
        data.cmd.forEach(element => {
            console.log("Run Element")
            console.log(element)
            socket.emit('sendbtzcmd', element.obj);
        });
    }else{
        socket.emit('sendbtzcmd', data.cmd);
    }
}

/**
 * Toggle fullscreen function who work with webkit and firefox.
 * @function toggleFullscreen
 * @param {Object} event
 */
function toggleFullscreen(event) {
    var element = document.body;
  
      if (event instanceof HTMLElement) {
          element = event;
      }
  
      var isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || false;
  
      element.requestFullScreen = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || function () { return false; };
      document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || function () { return false; };
  
      isFullscreen ? document.cancelFullScreen() : element.requestFullScreen();
  }