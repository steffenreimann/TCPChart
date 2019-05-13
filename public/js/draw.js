// mode 0 = default drag and drop
// mode 1 = draw 

var mode = 0 


function reload(){
    sync({reload: true})
  }
  
  var canvas = document.getElementById("myCanvas");
  var ctx = canvas.getContext("2d");
  
      var throttleInt = 5000;
  
     
  
      
      socket = io.connect();
  
      socket.on('sync', function (data) {
          console.log("Daten vom Server = ");
          console.log(data);

        if (data.element == "tacho1" || "tacho2") {
          if(data.width && data.height != "0"){
            const el = document.querySelector(data.element + "gau");
            el.dataset.width = data.width
          el.dataset.height = data.height
          }
        }

          $(data.element).css({top: data.top, left: data.left, position:'absolute'});
          $(data.element).css({width: data.width, height: data.height});
          $(data.element).css({border: data.cssd});


          if(data.reload == true){
            location.reload();
          };

          if(data.visi != undefined) {
            $(data.element).css("visibility", data.visi);
            console.log(data);
          }
      });

      socket.on('map', function (data) {
          //console.log("Daten vom Server = ");
          console.log(data);
          visi("#window", data.hidden)
          
       
         map.setCenter(new OpenLayers.LonLat(data.lan,data.lat) // Center of the map
         .transform(
           new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
           new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
         ), data.zoom // Zoom level
       );
      });
  
  
      $(document).on( "mousemove", function( event ) {
  
        $( "#test" ).text( "pageX: " + event.pageX + ", pageY: " + event.pageY );
        //sync({element: "#crosshair", left: event.pageX, top: event.pageY, click: event.buttons})
      });
      

      $(document).on( "mousedown", function( event ) {
        //$( "#test" ).text( "pageX: " + event.pageX + ", pageY: " + event.pageY );
        if(mode == 1){
            drawLine(event);
        }
      });
  
  
  function drawLine(data){
    ctx.moveTo(data.pageX,data.pageY);
    $(document).on( "mouseup", function( event ) {
        ctx.lineTo(event.pageX ,event.pageY);
        ctx.stroke();
        sync({element: "#crosshair", left: event.pageX, top: event.pageY, click: event.buttons})
    });
  }

  function visi(element, perm){
    sync({element: element, visi: perm})
    
  }


  function move(element, perm, disabled){
    
    console.log(element);
    console.log(perm);
    console.log(disabled);

    $( element ).draggable({ snap: true, disabled: !perm });

    if(perm){
      $( element ).on( "drag", function( event, ui ) {
        sync({element: element, left: ui.position.left, top: ui.position.top})
        //console.log(ui);
      });
    } 
  }
  //scale({element: "#window", disabled: true});
  function scale(element, perm){
    const el = document.querySelector(element + "gau");
    console.log(element);
    console.log(perm);
    $(element).resizable({disabled: !perm });
    $(element).on("resize", function( event, ui ) {
        sync({element: element, width: ui.size.width, height: ui.size.height})
        el.dataset.width = ui.size.width
        el.dataset.height = ui.size.height
        

        //console.log(ui);
    } );
  }
  
    $("#window").hover(function(){
      $(this).css("border", "solid 3px #6ebd76");
      $(this).css("width", "1920px");
      $(this).css("height", "400px");
     
      sync({element: "#window", css: "border", cssd: "solid 3px #6ebd76"})
      }, function(){
        $(this).css("width", "1920px");
        $(this).css("height", "340px");
      $(this).css("border", "solid 3px #78e382");
      sync({element: "#window", css: "border", cssd: "solid 3px #78e382"})
    });

    socket.on('cmd', function (data) {
              console.log(data);
    });

    socket.on('btz', function (data) {
              console.log(data);
              var hh = data.element 
              animiTacho(hh, data.val)
    });
    socket.on('sendbtzcmd', function (data) {
      console.log(data);
    });

      
      
      function anwend() {
        var radios = document.forms[0];
        var txt = "";
        var i;
        for (i = 0; i < radios.length; i++) {
          var ll = radios[i].value
          var uu = ll.split("-");
          console.log(uu)
          if (uu[0] == 'move') {

            move('#' + uu[1], radios[i].checked)

          }else if(uu[0] == 'scale'){

            scale('#' + uu[1], radios[i].checked)

          }else if(uu[0] == 'visi'){
            //vis('#window', true, false)
            if (radios[i].checked) {
              visi('#' + uu[1], 'visible')
            }else{
              visi('#' + uu[1], 'hidden')

            }
            
          }

          if (radios[i].checked) {
            

            console.log('radio true ' + radios[i].value );
          }else{


          }
        }
        
      }

      function testbtz(){
        console.log("testbtz start ");
        //console.log(data);

        var interval;
        $('#testbtzrange').on({
          mousedown : function () {
            console.log("testbtz mousedown ");
            var el = $(this);
            //el.val(parseInt(el.val(), 10) + 1);

            interval = window.setInterval(function(){
              //el.val(parseInt(el.val(), 10) + 1);
              var val = el.val();
              console.log(val);
              socket.emit('btz', {element: 'tacho1', val: val});
            }, 500);
          },
          mouseup : function () {
            window.clearInterval(interval);
          }
        });

        
      }  

  
      function send(cmd){
          socket.emit('cmd', { cmd: cmd});
      }
  
      function sync(data){
          //console.log("Daten zum Server = ");
          //console.log(data);

          
          socket.emit('sync', data);
      }    

      function initmap() {
        testbtz();
        map = new OpenLayers.Map("basicMap");
        var mapnik = new OpenLayers.Layer.OSM();
        map.addLayer(mapnik);
        map.setCenter(new OpenLayers.LonLat(13.41,52.52) // Center of the map
          .transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
            new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
          ), 15 // Zoom level
        );
      }

      //setDeg('line', 120);

      function setDeg(element, val){
        var string = "rotate(" + val + "deg)";
        document.getElementById(element).style.transform = string;
      }

      var geschw = 0 
      function animiTacho(element, val){
        console.log(element);
        console.log(val);



        const el = document.querySelector("#" + element + "gau");
          el.dataset.value = val

        //setDeg(element, under4)
    
        geschw = val 
      }

      const mapping = (num, in_min, in_max, out_min, out_max) => {
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
      }



      