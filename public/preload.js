const {
  contextBridge
} = require("electron");
const fs = require('fs');
const {PythonShell} = require('python-shell');


contextBridge.exposeInMainWorld(
  "api", {
    exists: (file) => {
      return fs.existsSync(file)
    },
    saveFile: (file, data) => {
      try { fs.writeFileSync(file, data); }
      catch(e) { alert(e); }
    },    
    readFile: (file) => {
      try { return fs.readFileSync(file, {encoding:'utf8', flag:'r'}); }
      catch(e) { alert(e); }
    },
    deleteFile: (file) => {
      try { fs.unlinkSync(file); }
      catch(e) { alert(e); }
    },
    pyRun: (file, args) => {
      let pyshell = new PythonShell(file, {args: args});
      pyshell.on('message', function(message) {
        console.log(message);
      })
      pyshell.end(function (err) {
        if (err){
          throw err;
        };
        console.log('finished');
      });      
    }
  });