const electron = require('electron');
const {ipcRenderer} = electron;

console.log("auf gehts");
testubg = ipcRenderer.sendSync('MapWindowData');
console.log(testubg);





