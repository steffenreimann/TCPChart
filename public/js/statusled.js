function set_led(id, color) {
    var element = document.getElementById(id);

    element.classList.remove('led-red');
    element.classList.remove('led-blue');
    element.classList.remove('led-yellow');
    element.classList.remove('led-green');
    element.classList.remove('led-off');

    if(color == 'red'){
        console.log(color);
        element.classList.add('led-red');
    }
    if(color == 'blue'){
        console.log(color);
        element.classList.add('led-blue');
    }
    if(color == 'yellow'){
        console.log(color);
        element.classList.add('led-yellow');
    }
    if(color == 'green'){
        console.log(color);
        element.classList.add('led-green');
    }
    if(color == 'off'){
        console.log(color);
        element.classList.add('led-off');
    }
}



//document.getElementById("MyElement").classList.add('MyClass');

//document.getElementById("MyElement").classList.remove('MyClass');

//if ( document.getElementById("MyElement").classList.contains('MyClass') )

//document.getElementById("MyElement").classList.toggle('MyClass');