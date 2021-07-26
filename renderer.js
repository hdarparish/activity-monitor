const { ipcRenderer } = require("electron");
const ProgressBar = require("progressbar.js");
const _ = require("lodash");

/* const cpuProgress = document.getElementById("cpu-progress");
const cpuHeader = document.getElementById("cpu-header");
const memoryProgress = document.getElementById("memory-progress");
const memoryHeader = document.getElementById("memory-header"); */
let tbody = document.getElementById("tData");
let cpuDetails = document.getElementById("cpu-details");
let memoryDetails = document.getElementById("memory-details");
let gpuDetails = document.getElementById("gpu-details");
/* const NOTIFICATION_TITLE = "Title";
const NOTIFICATION_BODY =
  "Notification from the Renderer process. Click to log to console.";
const CLICK_MESSAGE = "Notification clicked";

new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY }).onclick =
  () => console.log(CLICK_MESSAGE);
 */

const cpuBar = new ProgressBar.SemiCircle("#cpu-container", {
  strokeWidth: 6,
  color: "#FFEA82",
  trailColor: "#eee",
  trailWidth: 1,
  easing: "easeInOut",
  svgStyle: null,
  text: {
    value: "",
    alignToBottom: false,
  },
  from: { color: "#30a1c4" },
  to: { color: "#e62910" },
  // Set default step function for all animate calls
  step: (state, cpuBar) => {
    cpuBar.path.setAttribute("stroke", state.color);
    let value = Math.round(cpuBar.value() * 100);
    if (value === 0) {
      cpuBar.setText("");
    } else {
      cpuBar.setText(`${value}%`);
    }

    cpuBar.text.style.color = state.color;
  },
});
cpuBar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
cpuBar.text.style.fontSize = "2rem";

const memoryBar = new ProgressBar.SemiCircle("#memory-container", {
  strokeWidth: 6,
  color: "#FFEA82",
  trailColor: "#eee",
  trailWidth: 1,
  easing: "easeInOut",
  svgStyle: null,
  text: {
    value: "",
    alignToBottom: false,
  },
  from: { color: "#30a1c4" },
  to: { color: "#e62910" },
  // Set default step function for all animate calls
  step: (state, memoryBar) => {
    memoryBar.path.setAttribute("stroke", state.color);
    let value = Math.round(memoryBar.value() * 100);
    if (value === 0) {
      memoryBar.setText("");
    } else {
      memoryBar.setText(`${value}%`);
    }

    memoryBar.text.style.color = state.color;
  },
});
memoryBar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
memoryBar.text.style.fontSize = "2rem";

//after the page loads communicate to main process
window.addEventListener("load", (e) => {
  ipcRenderer.send("on-load");
});

ipcRenderer.on("on-load-success", (e, data) => {
  console.log(data);
  let cpuModel = document.getElementById("cpu-model");
  cpuModel.innerText = `${data.cpuDetails.manufacturer} ${data.cpuDetails.brand} @ ${data.cpuDetails.speed} GHz`;

  //var text = document.createTextNode("Tutorix is the best e-learning platform");
  //tag.appendChild(text);
  //cpuDetails.appendChild(cpuModel);

  //memory details
  let memoryType = document.getElementById("memory-type");
  memoryType.innerText = `${Math.round(
    data.memoryUsage.total / 1000000000
  )} GB`;
  //memoryDetails.appendChild(memoryTotal);
});

//update the cpu status every 1 second
setInterval((e) => {
  ipcRenderer.send("get-status");
}, 3000);

const updateProcessList = (processList) => {
  //console.log(processList);
  tbody.innerHTML = "";
  /*   processList.sort(function (a, b) {
    return a.memUsage - b.memUsage;
  }); */

  processList.map((element, index) => {
    let row = tbody.insertRow(index);
    row.insertCell(0).innerHTML = element.imageName;
    row.insertCell(1).innerHTML = `${(element.memUsage / 1000000).toFixed(
      2
    )} MB`;
  });
};

const updateCpu = (cpuUsage) => {
  let cpu = Math.round(cpuUsage.currentLoad);
  cpuBar.animate(cpu / 100);
};

const updateMemory = (memoryUsage) => {
  let memoryUsed = memoryUsage.used / memoryUsage.total;
  memoryBar.animate(memoryUsed);
};

ipcRenderer.on("status-success", (e, data) => {
  updateCpu(data.cpuUsage);
  updateMemory(data.memoryUsage);
  updateProcessList(data.topList);
});

/* 
{
  brand: "Core™ i9-10850K"
cache: {l1d: 0, l1i: 0, l2: 2621440, l3: 20971520}
cores: 20
family: "6"
flags: "de pse mce sep mtrr mca cmov psn clfsh ds acpi mmx fxsr sse sse2 ss htt tm ia64 pbe"
governor: ""
manufacturer: "Intel®"
model: "165"
physicalCores: 10
processors: 1
revision: ""
socket: "Other"
speed: 3.6
speedMax: 3.6
speedMin: 3.6
stepping: "5"
vendor: "GenuineIntel"
virtualization: true
voltage: ""
}
*/
