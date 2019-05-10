  const electron = require('electron');
    const {ipcRenderer} = electron;
    const {dialog} = require('electron').remote;

var conf = ipcRenderer.sendSync('NC_GET_CONF')
var OBS_F = ipcRenderer.sendSync('OBS_F')
var MIDIMapping
 var midilist = [];
var conlist0 = [];
// Key == id value = cmd(s)
var conListDict = {};
var conlist1 = [];
var devicelist1 = [];
var mapObj1
var ix = 0;
var data1 = "";
var model = require('./../electron/template.json');
var mapObj_option_html = []


console.log(conf);


ipcRenderer.on('selectedFiles', function(e, data){
        console.log(data);
        $( "#out" ).val(data.path);
    });

ipcRenderer.on('DOM', function(event, data){
    console.log("DOM Event ID : " + data.id);
    console.log("DOM Event val : " + data.val);
    console.log("DOM Event show : " + data.show);
    if(data.val && data.id != undefined){
        $( data.id ).val(data.val)
        $( data.id ).html(data.val)
}
    
    
    if(data.show != undefined){
        if(data.show == true){
                $( data.id ).removeAttr( "disabled" )
           }else if(data.show == false){
               $( data.id ).attr("disabled", true);
           }
    }
    });

ipcRenderer.on('LIST', function(event, data){
    
    console.log('DATALIST');
    console.log(data);
    data.data.forEach(function(element) {
      console.log(element);
        list('#ergebnis', element)
    }); 
    
    conlist0 = [];
    ix = 0;
});

ipcRenderer.on('MIDI_Mapping', function(event, data){
    //conlist1.push(scene);
    console.log('MIDI_Mapping');
    console.log(data);
    list('#out', data)
});

ipcRenderer.on('NC_SET_CONF', function(event, data){
   saveMIDIMapping();
});

$( "#obssave" ).click(function() {
      var ip = $( "#networkSectionIpAddress" ).val();
    console.log('Connect OBS IP ', ip);

    
    send('OBS','obsnet', {'ip': ip, 'pass': '123123' });
    send('OBS_CONNECT');
    //ipcRenderer.send('OBS_CONNECT' , () => {})
  });    

$( "#replay_buffer" ).click(function() {
    console.log('switch');
    var checkbox = $('input[type=checkbox]').prop('checked')
    var buffertime = $( "#buffertime" ).val();
    var bufsavet = $( "#bufsavet" ).val();   
    send('OBS','replay', {'check': checkbox, 'buffertime': buffertime, 'bufsavet': bufsavet });
    if(checkbox){
       console.log('True'); 
        send('OBS_CMD','StartReplayBuffer', {});
    }else{
       console.log('False'); 
        send('OBS_CMD','StopReplayBuffer', {});
    }
});

$( "#activ_mapping" ).click(function() {
    var checkbox = $('#activ_mapping').prop('checked')
    if(checkbox){
        send('f_mapping_start');
    }else{ 
        send('f_mapping_stop');
    }
});

$( "#mapping" ).click(function() {
    var checkbox = $('#mapping').prop('checked')
        send('MIDIMH');
});

$( "#replaystart" ).click(function() {
    var buffertime = $( "#buffertime" ).val();
   var bufsavet = $( "#bufsavet" ).val();
    send('OBS','replay', {'buffertime': buffertime, 'bufsavet': bufsavet });
      
   send('OBS_REPLAY');
    
  });

$( "#sendjsontest" ).click(function() {send('sendjsontest','replay');});

$( "#saveMIDIMapping" ).click(function() {
    var checkbox = $('input[type=checkbox]').prop('checked')
    if(checkbox){
       console.log('True'); 
        send('OBS_CONNECT');
    }else{
       console.log('False'); 
        send('OBS_DC');
    }
    
  });

$( "#conn_switch" ).click(function() {
    var checkbox = $('input[type=checkbox]').prop('checked')
    if(checkbox){
       console.log('True'); 
        send('OBS_CONNECT');
    }else{
       console.log('False'); 
        send('OBS_DC');
        
    }
    
  });

$( "#save-json-file" ).click(function() {
    console.log(path)
    
    
   
    
  });



    
function send(name,cmd,d){
    ipcRenderer.send(name, {'cmd': cmd, 'd': d } , () => { 
            console.log("Event sent."); 
        })
}

function loadMIDIMapping(){
    conlist1 = [];
    devicelist1 = [];
    //$('#out').html(conlist1);
    MIDIMapping = ipcRenderer.sendSync('MIDIMapping')
    
    $.each(MIDIMapping, function(i, item) {
        $.each(item, function(ii, itemm) {
            list('#out', itemm)
        });
    });
    
    
}

function loadDevices(){
    DeviceList = ipcRenderer.sendSync('DeviceList')
    $.each(DeviceList, function(i, item) {
        var kk = {device: item}
        console.log(item);
        list('#devices_out', item )
    });
}

function openfile(data){
    console.log(data);
    dialog.showOpenDialog({
        properties: ['openFile']
    }, function (files) {
        if (files !== undefined) {
            // handle files
            console.log(files)
            $('#' + data).val(files[0]) 
            ipcRenderer.send('openMapWindow', {'data': data, 'path': files[0] } , () => { 
            console.log("Event sent."); 
            })
        }
    });
}


function saveMIDIMapping(){
    
    //MIDIMapping = ipcRenderer.sendSync('MIDIMapping')
    
    $.each(MIDIMapping, function(i, item) {
        $.each(item, function(ii, itemm) {
            var midimapid = typeselector('midimapid', itemm)
            console.log('MIDImapID = ' + midimapid);
            var la
            try {
                var ch_cmd = document.getElementById(midimapid);
                la = JSON.parse(ch_cmd.value);
                
            } catch(e) {
                console.log(e); // error in the above string (in this case, yes)!
                console.log('erroooorrrrrrr'); // error in the above string (in this case, yes)!
                la = [];
            }
            
            
            console.log('ch_cmd.value = ' + la)
            console.log(la);
            var mapp = {channel: itemm.channel, note: itemm.note, controller: itemm.controller, velocity: itemm.velocity, _type: itemm._type, cmds: la }
            
            console.log(mapp);
            send('NC_SET_MAP','', mapp);
        });
    });
}

function list(name, data){
    
   var model = require('./../electron/template.json');
   //var model = model.html;
    var sourcelist = [];
   
    if(data.sources != undefined ){
       var visbol
       data.sources.forEach(function(element) {
            //model.sources.length
            console.log(element);
            if(element.render){
                visbol = 'visibility'
            }else{
                visbol = 'visibility_off'
            }
            var sourcesmapObj = {sourcename:element.name,sourcevol:element.volume, sourcerender: element.render, vissourcename: "vis" + element.name,   visbol: visbol};
           
            var source = replaceAll(model.source,sourcesmapObj );
            sourcelist.push(source);
        }); 
        console.log('HTML Model Test === ' + model);
        var mapObj = {ix:ix,data:data.name, option: data.name, idinput: "but" + data.name, sources: sourcelist};
        var scene = replaceAll(model.html,mapObj );
        conlist0.push(scene);
        $(name).html(conlist0);
        
      }
    
    if(data.channel != undefined ){
            var midimapid = typeselector("midimapid", data)
            var midimapval = typeselector("midimapval", data)
            var id = typeselector('blnk', data)
            
            
            
            //var mapObj_option = replaceAll(model.MIDIMapping, mapObj1 );
            
            var mapObj1 = {midimapid: midimapid, midimapouttext: JSON.stringify(data.cmds, undefined, 4) };
            var MIDI_Mapping1 = replaceAll(model.MIDIMapping, mapObj1 );
        
           // alert( 'model.MIDIMapping = ' + model.MIDIMapping);
            //alert( 'data.cmds = ' + data.cmds);
           // alert( 'FIND MIDI_Mapping1 = ' + MIDI_Mapping1);
        
            var mapObj = {option: typeselector('', data) , idinput: id, sources: MIDI_Mapping1};
            var scene = replaceAll(model.html2,mapObj );
        
        console.log(data); 
        console.log('data = ' + data);
        var ui = 1
        // if(findInArray(conlist1, scene)){
        if(conListDict[midimapid] !== undefined){
            var id2 = typeselector('#blnk', data)
            console.log('HTML id = ' + id2);
            
            if(data._type == 'noteoff'){
                    scrolldown(id2)
               }
            if(data._type == 'cc'){
                    scrolldown(id2)
               }
            
            $(id2).addClass("list-group-item-success");
            //$(id).css({"background-color": "blue", "font-size": "100%"});
            setTimeout(function(){ 
               //$(id).css({"background-color": "red", "font-size": "100%"});
                $(id2).removeClass("list-group-item-success");
            }, 500);
            
            
           }else{
               
                conlist1.push(scene);
                conListDict[midimapid] = midimapid; 
                $(name).html(conlist1);
           }
    }
    if(data.MapPath != undefined ){
        console.log('data.device', JSON.stringify(data));
        var mapObj2 = {openfileID: data.domID, IDName: data.name, MapPath: data.MapPath };
        console.log('mapObj2 ', mapObj2);
        var MIDI_Devices_HTML = replaceAll(model.MIDIDevices, mapObj2 );
        console.log('html ', MIDI_Devices_HTML);             
        devicelist1.push(MIDI_Devices_HTML);
        $(name).html(devicelist1);
    }
};


// function to search array using for loop
function findInArray(ar, val) {
    for (var i = 0,len = ar.length; i < len; i++) {
        if ( ar[i] === val ) { // strict equality test
            //return i;
            return true;
        }
    }
    //return -1;
    return false;
}

function typeselector(id , msg){
    if(msg._type == 'cc'){
        return id + msg.channel + msg.controller + msg._type
    }else{
        return id + msg.channel + msg.note + msg._type
    }
}

function boll(a, b){
    console.log(a);
    if(a != undefined && b != undefined){
        if(msg._type == 'cc'){
            if(a.channel == b.channel && a.controller == b.controller && a._type == b._type){
                return true
            }else{
                return false
            }
        }else{
            if(a.channel == b.channel && a.note == b.note && a._type == b._type){
                return true
            }else{
                return false
            }
        }
    }else{
        return false
    }
}

function replaceAll(str,mapObj){
    var re = new RegExp(Object.keys(mapObj).join("|"),"gi");
    console.log(re);
    return str.replace(re, function(matched){
        //console.log(mapObj);
        //console.log(matched);
        return mapObj[matched];
    });
}

function scrolldown(q) {
    //console.log(q);
    var pos = $(q).position(); 
    //console.log(pos);
    document.documentElement.scrollTop = document.body.scrollTop = pos.top;
}


function listdel() {
    conlist1 = [];
    conListDict = {};
    $('#out').html(conlist1);
}

function test(){
    console.log("Hallo ich bin der test");
}

var jsonFNtest = {fn:"test"}
//myNameSpace[jsonFNtest.fn]();
window[jsonFNtest.fn]();
  
var jsonFNtest = {fn:"test"}

//myNameSpace[jsonFNtest.fn]();

//window[jsonFNtest.fn]();
loadDevices();
//loadMIDIMapping();
$( "#buffertime" ).val(conf.replay.buffertime);
$( "#bufsavet" ).val(conf.replay.bufsavet);
$( "#networkSectionIpAddress" ).val(conf.obsnet.ip);