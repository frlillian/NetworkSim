# Comunications Simpulation Script (CSS)
This script alows users to simply simulate a hypethetical netork. THIS IS A SIMPLE TOOL AND SHOULD NOT BE CONSIDERED AN ACCURATE SIMULATION OF REAL CONDITIONS. To acomplish this, it uses three kinds of files. 
First, the Network file. This file is responsable for creating a list of links that the network in question contains. These links may have an arbutary number of hosts connected to them (so they can support simulating networks on to themselves, rather than physical links). The nodes category is for organization an is not used in this instance of the script.
Second, the vignettes files. These files describe a single "vignette" and must be named "\<vignette name\>.json". A vignette is a set of logicaly connected data flows. A data flow is simulated data moving from one point to another along, connected links. For example and vignette might be "Missle Threat", consiting of a data flow from the RTS Comms link to EGS to FORGE RGS and some other flow that starts when EGS is done transmiting. The ordered list of links a flow takes, is called it's path.
Third, the Commands file. This file lists commands that order the start of vignettes at spesific times in the simulation. For example, a Commands file might order three Missle Threat vignettes to start at times 0, 20, and 40, and a Fighting PNT vignette at time 30. The command file also contains a list of vignettes that are in use, this list failing to update is a common source of bugs. Insure that all vignettes have there file name sans .json in this list.
These three files come together to allow the user to determin how exactly data is transmited during the simulation.

### The Network File
Each link in this file contains two critical variables: bandwidth and delay. The delay of a link is how long it takes for data to be loaded on to the wire (or it can be thought of as the classical networking delay). Bandwidth is the total bandwidth of the link. After waiting the delay time, a packet is trasmited using a proportion of the bandwith that is alocated to it (1/2 if there is one other packet on the link, 1/3 if two others, and so on). While not a perfect representation of network behavor, it is a heuristic. Each time unit, it will add it's proportion of the bandwidth to its transmited total. Once this number reaches 100 (currently all packets are 100 in size, but variable packet sizes might come in a future updata, if you need to have variable sizes on messages, consider transmiting mutiple times on the same link to simulate a larger message) it will be considered sent and the flow will move on to sending the next link in its path.

### Results
The results of each run can be seen in the plots folder and the log.txt file that both live in the root directory

### Errors
If you run the simulation and no graphs are produced, there are two locations that might contain helpful information. First, log.txt in the root folder. Errors that appear here will be problems with malformed json files. The second is the debuger window that opens when the app is launched. Errors that are logged here, are generaly deeper and might need to be adressed by a maintainer.

## Install
Currently, this app can not be built functionaly for releace. To run the app follow the below instructions:
0. Have npm, nodejs, python, pip and yarn installed
1. clone this repo
2. For windows users : '$Set-ExecutionPolicy RemoteSigned'
3. '$ npm run install'
4. yarn dev

### TODOs
- add prioirty funtionality (1/2 day) - not how commercial networks deal with trafic, do more research on millitary network functions

- Add output filtering by flow/command (1/3 day) - is this even something people want?

- Implement mechine learning / fuzzing (3 weeks)

- Save state to file and load on reload, so it doen't boot user on save