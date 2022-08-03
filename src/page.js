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
  const [log, setLog] = useState([])

  function readJSON(file, setfunction) {
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

  function readLog(file) {
    if (window.api.exists(file)) {
      return window.api.readFile(file)
    } else {
      return ["No Log File"]
    }
  }

  let write = (data, file) => {
    window.api.saveFile(file, JSON.stringify(data, null, 4))
  };

  async function refresh() {
    const c = await (readJSON("./commands.json"))
    setCommands(c)
    c.vignettes.forEach(
      async function(vignette) {
        if (!Object.keys(vignettes).includes(vignette) && window.api.exists("./public/" + vignette + ".json")) {
          vignettes[vignette] = await readJSON("./" + vignette + ".json")
        }
    })
    setNetwork(await readJSON("./network.json"))
    setLog((await readLog("./log.txt")).split('\n'))
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

  async function run() {
    let args = []
    Object.keys(vignettes).forEach(
      function(vignette) {
        args.push("./public/" + vignette + ".json")
      }
    )
    window.api.pyRun('./public/run.py', args)
    setLog((await readLog("./log.txt")).split('\n'))
  }
  
  function save() {
    console.log(vignettes)
    Object.keys(vignettes).forEach(
      function(vignette) {
        console.log(vignette)
        // if (window.api.exists("./public/" + vignette + ".json")) {
        write(vignettes[vignette], "./public/" + vignette + ".json")
        // }
        if (!commands.vignettes.includes(vignette)) {
          commands.vignettes.push(vignette)
        }
    })
    write(commands, "./public/commands.json")
    write(network, "./public/network.json")
  }

  function vignetteChange(e) {
    if (e.target.id == 'newVignette') {
      setVignette({name: "", finishedFlows: 0, flows: [{name: "newFlow", startCondition: "clock", clock: 0, path: []}]})
    } else {
      setVignette(vignettes[e.target.id])
    }
    setBlink(1)
  }

  function vignetteTabMouseDown(e) {
    console.log(vignettes)
    setBlink(0)
  }

  function vignetteDelete(e) {
    if (e.target.id == 'newVignette') {
    } else {
      delete vignettes[vignette["name"]]
      window.api.deleteFile("./public/" + vignette["name"] + ".json")
      const index = commands.vignettes.indexOf(vignette["name"]);
      if (index == -1) {
        console.log("vignette was not in the commands.json vignette list?")
      } else {
        commands.vignettes.splice(index, 1)
        write(commands, "./public/commands.json")
      }
      setVignette({name: "", finishedFlows: 0, flows: [{name: "newFlow", startCondition: "clock", clock: 0, path: []}]})  
    }
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
                  return <rux-button id={key} onMouseDown={vignetteTabMouseDown} onMouseUp={vignetteChange}>{key}</rux-button>
                })}
                <rux-button id='newVignette' onMouseDown={vignetteTabMouseDown} onMouseUp={vignetteChange}>New Vignette</rux-button>
              </div>
              {blink == 1 &&
                <div id = 'right'>
                <Editor
                  value = {vignette}
                  onChange = {json => {
                    delete vignettes[vignette["name"]]
                    delete vignettes[json.name]
                    setVignettes(prevState => ({
                      ...prevState,
                      [json.name]: json
                    }))
                    setVignette(json)
                    }
                  }
                />
                <rux-button id='vignetteDelete' onClick={vignetteDelete}>Delete Vignette</rux-button>
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
          {selected == 3 &&
            <div>
              <div id="log">
                {log.map((line) => {
                  return <p>{line}</p>
                })}
              </div>
            </div>
          }
          {selected == 4 &&
            <div>
              {Object.keys(network.links).map((link) => {
                return (
                  <div>
                    <p>{link}</p>
                    <img src={"./Plots/" + link + ".png"}/>
                  </div>
              )})}
            </div>
          }
        </div>
      )}
      <div id="buttons">
        <rux-button id="run" onClick={run}>
          Run Simulation
        </rux-button>
        <rux-button id="save" onClick={save}>
          Save
        </rux-button>
      </div>
    </div>
  )
}

export default Page;