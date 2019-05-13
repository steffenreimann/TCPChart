var cmdarr = [{cmd: '!lol', obj: {
    "device": "all", 
    "category":"control",
    "command": "test", 
    "data":{"mode": "w", "state": true, "name": "jamoin"}}}]

function init(){

}


function initCMDLine() {
    var CMDLineHistory = [];
    var CMDLineHistoryCounter = 0;

    var element = document.getElementById('CMDLine')
    element.addEventListener ('keydown', function (e) {
        if (event.which == 13) {
            text = element.val()
            
            element.val("")
            
            if(text != "" && CMDLineHistory[CMDLineHistoryCounter] != text){
                CMDLineHistory.push(text)
                CMDLineHistoryCounter = CMDLineHistoryCounter + 1
            }
            
        }
        if(e.keyCode == 40){
            if(CMDLineHistoryCounter + 1 <= CMDLineHistory.length){
                CMDLineHistoryCounter = CMDLineHistoryCounter + 1   
            }  
            element.val(CMDLineHistory[CMDLineHistoryCounter])
        }
        if(e.keyCode == 38) {
            if(CMDLineHistoryCounter - 1 >= 0){
                CMDLineHistoryCounter = CMDLineHistoryCounter - 1   
            }
            element.val(CMDLineHistory[CMDLineHistoryCounter])  
        }
    });
}

//zufiltender string ob es ein cmd enthält  
//array von objs wo der cmd und data zum abgleichen drin sind
//return ist ein array aus allen cmds die gefunden wurden
function filterCMD(str, arr) {
    var strarr = str.split(' ');
    var cmds = []
    strarr.forEach(element1 => {
        arr.forEach(element2 => {
            if(element1 == element2.cmd){
                cmds.push(element2);
            }
        });
    });
    return cmds
}

console.log(filterCMD("!lol", cmdarr));


//cmds = Obj or Array of Objs
function runMultiCMD(cmds) {
    if(cmds.isArray(cmds)){
        cmds.forEach(element => {
            socket.emit('sendbtzcmd', {
                "device": "all", 
                "category":"control",
                "command": element, 
                "data":{"mode": "w", "state": true, "name": "jamoin"}
                });
        });
    }else{
        socket.emit('sendbtzcmd', {
            "device": "all", 
            "category":"control",
            "command": element, 
            "data":{"mode": "w", "state": true, "name": "handware ker"}
        });
    }
}

function addCMDLine(cmd, obj) {
    
}

