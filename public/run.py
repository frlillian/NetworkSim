#!/usr/bin/python3
import json
import sys
import copy
import time
import matplotlib.pyplot as plt

# Env Variables
NETWORK_FILE = './public/network.json'
COMMAND_FILE = './public/commands.json'
VIGNETTE_FILES = sys.argv[1:]
REALTIME = False

# State Variables
clock = 0
done = False
activeFlows = {}
activeVignettes = {}
triggeredCommands = 0
finishedVignettes = 0
ERROR = ""

# Importing network
f = open(NETWORK_FILE)
network = json.load(f)

# Ploting Tools and error checking network
x = []
y = {}
for link in network["links"]:
  y[link] = []
  if "bandwidth" not in network["links"][link] or "delay" not in network["links"][link]:
    ERROR = "ERROR!!! " + link + " link does not have the bandwidth or delay key. Every link must have these"


# Importing Commands
f = open(COMMAND_FILE)
commands = json.load(f)["commands"]

# Importing Vignettes and error checking
vignettes = {}
for file in VIGNETTE_FILES:
  f = open(file)
  vignette = json.load(f)
  vignettes[vignette["name"]] = vignette
  if "name" not in vignette or "finishedFlows" not in vignette or "flows" not in vignette:
    ERROR = "ERROR!!! " + str(file) + " file does not have the name, finishedFlows, or flows keys. Every vignette must have these"
  if vignette["name"] + ".json" != str(file).split('/')[-1]:
    ERROR = "ERROR!!! " + str(file) + " file does not have the correct name in its name feild. It must match the name of the file"
  for flow in vignette["flows"]:
    if len(flow["path"]) <= 0:
      ERROR = "ERROR!!! " + str(file) + " file contains a flow ("+flow["name"]+") that has an empty path"
    for link in flow["path"]:
      if isinstance(link, list):
        link = link[0]
      if link not in network["links"]:
        ERROR = "ERROR!!! " + str(file) + " file references a link ("+link+") in flow ("+flow["name"]+")that does not exist in the network file."

# Error checking commands
for command in commands:
  if "clock" not in commands[command] or "vignette" not in commands[command]:
    ERROR = "ERROR!!! " + command + " command does not have the clock or vignette key. Every command must have these"
  if commands[command]["vignette"] not in vignettes:
    ERROR = "ERROR!!! " + command + " command references a vignette that does not exist"


# Helping Funtions

## commandCheck iterates over all the commands the simulation has been
## given and starts vignettes when they are sloted to begin
def commandCheck():
  global commands
  global clock
  global vignettes
  global activeVignettes
  global triggeredCommands

  for command in commands:
    if commands[command]["clock"] == clock:
      vignette = copy.deepcopy(vignettes[commands[command]["vignette"]])
      # vignette["command"] = command
      activeVignettes[command] = vignette
      triggeredCommands = triggeredCommands + 1
      print("Starting " + command + " Vignette at clock " + str(clock))

## flowCheck iterates over all of the flows in the simulation and stars
## ones that are sloted to begin
def flowCheck():
  global activeVignettes
  global clock
  global activeFlows
  global network
  global commands
  for v in activeVignettes:
    vignette = activeVignettes[v]
    for flow in vignette["flows"]:
      if (flow["startCondition"] == "clock"):
        # checking to see if the relative clock to start a flow is equal to the current clock
        # if a flow starts at clock 15 and it's vignette starts at clock 5, it will actualy start
        # at clock 20
        if (flow["clock"] == clock - commands[v]["clock"]):
          flowname = flow["name"] + v
          activeFlows[flowname] = {
              "flow": flow,
              "command": v,
              "link": 0,
              "clockAtLink": 0,
              "path": flow["path"],
              "amountTransmited": 0,
              "doneTransmiting": False
            }
          # increasing the number of flows counted on the network object for the first link in this flow path
          if isinstance(flow["path"][0], str):
            (network["links"][flow["path"][0]])["numFlows"] = (network["links"][flow["path"][0]])["numFlows"] + 1
          if isinstance(flow["path"][0], list):
            (network["links"][flow["path"][0][0]])["numFlows"] = (network["links"][flow["path"][0][0]])["numFlows"] + 1
      if (flow["startCondition"] == "flow link"):
        if (flow["flow"] + v in activeFlows.keys()):
          # checking to see if the flow spawns this flow is done with the link we assined
          if (activeFlows[flow["flow"] + v]["link"] == flow["link"] and flow["name"] not in activeFlows.keys() and activeFlows[flow["flow"] + v]["doneTransmiting"]):
            flowname = flow["name"] + v
            print("Starting flow " + flowname)
            activeFlows[flowname] = {
                "flow": flow,
                "command": v,
                "link": 0,
                "clockAtLink": 0,
                "path": flow["path"],
                "amountTransmited": 0,
                "doneTransmiting": False
              }
            if isinstance(flow["path"][0], str):
              (network["links"][flow["path"][0]])["numFlows"] = (network["links"][flow["path"][0]])["numFlows"] + 1
            if isinstance(flow["path"][0], list):
              (network["links"][flow["path"][0][0]])["numFlows"] = (network["links"][flow["path"][0][0]])["numFlows"] + 1

def updatePlot():
  global x
  global y
  global network
  global clock

  x.append(clock)
  for link in network["links"]:
    y[link].append(network["links"][link]["numFlows"])

def clockStep():
  global activeFlows
  global network
  global clock
  global activeVignettes
  global finishedVignettes

  for flow in list(activeFlows):
    linkData = activeFlows[flow]["path"][activeFlows[flow]["link"]]
    if isinstance(linkData, str):
      linkName = linkData
      datasize = 100
    if isinstance(linkData, list):
      datasize = linkData[1]
      linkName = linkData[0]
    link = network["links"][linkName]
    activeFlows[flow]["clockAtLink"] = activeFlows[flow]["clockAtLink"] + 1

    # checking to see if we have waited the full delay clock yet
    if activeFlows[flow]["clockAtLink"] >= link["delay"]:
      flowsOnLink = link["numFlows"]

      # here is where we modify the amountTransmited based on the total bandwidth and number of flows of the link
      if flowsOnLink != 0:
        activeFlows[flow]["amountTransmited"] = activeFlows[flow]["amountTransmited"] + (link["bandwidth"] / flowsOnLink)
      print("Flow " + str(flow) + " " + str(min(activeFlows[flow]["amountTransmited"], datasize)) + " transmited on " + linkName)
      # if we have finished transmiting last step, then we resolve
      if activeFlows[flow]["doneTransmiting"]:
        path = activeFlows[flow]["path"]
        for i in range(len(path)):
          if i == activeFlows[flow]["link"]:
            if len(path) - 1 == activeFlows[flow]["link"]:
              vignette = activeVignettes[activeFlows[flow]["command"]]
              vignette["finishedFlows"] = vignette["finishedFlows"] + 1
              if vignette["finishedFlows"] == len(vignette["flows"]):
                finishedVignettes = finishedVignettes + 1
              del activeFlows[flow]
            else:
              activeFlows[flow]["link"] = activeFlows[flow]["link"] + 1
              linkData = activeFlows[flow]["path"][activeFlows[flow]["link"]]
              if isinstance(linkData, str):
                linkName = linkData
                datasize = 100
              if isinstance(linkData, list):
                datasize = linkData[1]
                linkName = linkData[0]
              network["links"][linkName]["numFlows"] = network["links"][linkName]["numFlows"] + 1
              activeFlows[flow]["amountTransmited"] = 0
              activeFlows[flow]["clockAtLink"] = 0
              activeFlows[flow]["doneTransmiting"] = False
            break
      # checking to see if we have finished transmiting
      # we do this after the above if statment because we must give connecting flows
      # a clock step to notice we are done. Call it processing clock at the node.
      if flow in activeFlows:
        if activeFlows[flow]["amountTransmited"] >= datasize:
          network["links"][linkName]["numFlows"] = network["links"][linkName]["numFlows"] - 1
          activeFlows[flow]["doneTransmiting"] = True
  commandCheck()
  flowCheck()
  print("Finished Time Step " + str(clock))


# Running Simulation
with open('log.txt', 'w') as f:
  sys.stdout = f
  while not done:
    if ERROR != "":
      done = True
      print(ERROR)
      break
    clockStep()
    updatePlot()
    clock = clock + 1
    if REALTIME:
      time.sleep(1)
    if len(activeFlows) == 0 and len(commands) == finishedVignettes and triggeredCommands == len(commands):
      done = True
    if clock > 500:
      done = True

  for link in network["links"]:
    plt.plot(x, y[link])
    plt.xlabel('time')
    plt.ylabel('number of transmitions')
    plt.savefig('./public/Plots/' + link + '.png')
    plt.clf()

  sys.stdout.flush()