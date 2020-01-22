//Steffen Reimann Jan 2020
var fs              = require('fs');
function getLogDir(callback, directoryPath) {

    var logindex = 0
    var filesindex = 1
    let index = 0;
    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            return err
        } 
        if(files.length == 0){
            callback({LogFiles: 0, files: []}) 
        }
        filesindex = files.length
        filesindex = filesindex - 1
        //console.log('files lenght = ' + files.length)
        files.forEach(element => {
            //console.log('logindex = ' + index)
            var obj = element.split('-');
            //console.log(obj[0]);
            if (obj[0] == 'log') {
                //console.log('logindex++');
                logindex++
            }
            if(filesindex == index){
                //console.log('finnish');
                //console.log(logindex);
                callback({LogFiles: logindex, files: files}) 
            }
            index++
        }); 
    }); 
}



function checkFile(params) {
    
}


module.exports = {
    getDir: getLogDir,
    getFileInfo: checkFile
};