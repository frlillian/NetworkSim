import { JsonEditor as Editor } from 'jsoneditor-react';
// import 'jsoneditor-react/es/editor.min.css';
import './App.css';
import React, { useEffect, useState } from "react"
// export const sendData = (data, file) => {

//   ipcRenderer.send("file_write", [data, file]);
  
//   };
  
//   ipcRenderer.on("file_write", (event, arg) => {
  
//   console.log(arg);
  
// });

function Page() {
  const [commands, setCommands] = useState({})
  const [network, setNetwork] = useState({})
  const [tabs, setTabs] = useState(null)
  const [runButton, setRunButton] = useState(null)
  const [saveButton, setSaveButton] = useState(null)
  const [selected, setselected] = useState(-1)
  const [vignettes, setVignettes] = useState({})
  const [vignette, setVignette] = useState({})
  const [blink, setBlink] = useState()

  function read(file, setfunction) {
    return fetch(file)
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
    .then(json => {
      return (json)
    })
  }

  let write = (data, file) => {
    window.api.saveFile(file, JSON.stringify(data, null, 4))
  };

  async function refresh() {
    const c = await (read("./commands.json"))
    setCommands(c)
    Object.keys(c.commands).forEach(
      async function(command) {
        if (!Object.keys(vignettes).includes(c.commands[command].vignette) && window.api.exists("./public/" + c.commands[command].vignette + ".json")) {
          vignettes[c.commands[command].vignette] = await read("./" + c.commands[command].vignette + ".json")
        }
    })
    setNetwork(await read("./network.json"))
  }

  useEffect(() => {
    refresh()
    setTabs(document.getElementById("tabs"))
    setRunButton(document.getElementById("run"))
    setSaveButton(document.getElementById("save"))
  }, [])
  if (tabs == null) {
    return;
  }
  tabs.addEventListener("ruxselected", function(tab){
    setTabs(document.getElementById("tabs"))
    for (let i = 0; i < tabs.children.length; i++) {
      if (tabs.children[i] == tab.detail) {
        setselected(i);
      }
    }
  })

  runButton.addEventListener("click", function(e){
    let args = []
    Object.keys(vignettes).forEach(
      function(vignette) {
        args.push("./public/" + vignette + ".json")
      }
    )
    window.api.pyRun('./public/run.py', args)
  })

  saveButton.addEventListener("click", function(e){
    write(commands, "./public/commands.json")
    Object.keys(vignettes).forEach(
      function(vignette) {
        // if (window.api.exists("./public/" + vignette + ".json")) {
          write(vignettes[vignette], "./public/" + vignette + ".json")
        // }
    })
    write(network, "./public/network.json")
  })

  function vignetteChange(e) {
    if (e.target.id == 'newVignette') {
      setVignette({name: "", finishedFlows: 0, flows: [{name: "newFlow", startCondition: "clock", clock: 0, path: []}]})
    } else {
      setVignette(vignettes[e.target.id])
    }
    setBlink(1)
  }

  function vignetteTabMouseDown(e) {
    setBlink(0)
  }
  return (
    <div id='page'>
      {Object.keys(network).length > 0 && (
        <div>
          {selected == -1 &&
            <div id='left'></div>
          }
          {selected == 0 && 
            <Editor
            value = {commands}
            onChange = {json => {
              setCommands(json)
              }
            }
            />
          }
          {selected == 1 && 
            <div id = 'container'>
              <div id = 'left'>
                {Object.keys(vignettes).map((key) => {
                  return <rux-button id={key} onMouseDown={vignetteTabMouseDown} onClick={vignetteChange}>{key}</rux-button>
                })}
                <rux-button id='newVignette' onMouseDown={vignetteTabMouseDown} onClick={vignetteChange}>New Vignette</rux-button>
              </div>
              {blink == 1 &&
                <div id = 'right'>
                <Editor
                  value = {vignette}
                  onChange = {json => {
                    delete vignettes[vignette["name"]]
                    setVignettes(prevState => ({
                      ...prevState,
                      [json.name]: json
                    }))
                    setVignette(json)
                    
                    }
                  }
                />
                </div>
              }
            </div>
          }
          {selected == 2 && 
            <Editor
            value = {network}
            onChange = {json => {
              setNetwork(json)
              }
            }
            />
          }
        </div>
      )}
    </div>
  )
}

export default Page;