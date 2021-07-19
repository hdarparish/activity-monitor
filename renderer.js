const { ipcRenderer, ipcMain } = require("electron");
const ProgressBar = require("progressbar.js");

/* const cpuProgress = document.getElementById("cpu-progress");
const cpuHeader = document.getElementById("cpu-header");
const memoryProgress = document.getElementById("memory-progress");
const memoryHeader = document.getElementById("memory-header"); */
let tbody = document.getElementById("tData");
let cpuDetails = document.getElementById("cpu-details");
let memoryDetails = document.getElementById("memory-details");

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

//bar.animate(1.0);

//after the page loads communicate to main process
window.addEventListener("load", (e) => {
  ipcRenderer.send("on-load");
});

ipcRenderer.on("on-load-success", (e, data) => {
  console.log(data);
  let cpuModel = document.createElement("p");
  let cpuCores = document.createElement("p");
  let cpuSpeed = document.createElement("p");
  cpuModel.innerText = `Model: ${data.cpuDetails.manufacturer} ${data.cpuDetails.brand}`;
  cpuCores.innerText = `Cores: ${data.cpuDetails.physicalCores}`;
  cpuSpeed.innerText = `Speed: ${data.cpuDetails.speed} GHz`;

  //var text = document.createTextNode("Tutorix is the best e-learning platform");
  //tag.appendChild(text);
  cpuDetails.appendChild(cpuModel);
  cpuDetails.appendChild(cpuCores);
  cpuDetails.appendChild(cpuSpeed);

  //memory details
});

//update the cpu status every 1 second
setInterval((e) => {
  ipcRenderer.send("get-status");
}, 1000);

const updateProcessList = (processList) => {
  tbody.innerHTML = "";
  processList.sort(function (a, b) {
    return a.memUsage - b.memUsage;
  });
  processList.forEach((element) => {
    let row = tbody.insertRow(0);
    row.insertCell(0).innerHTML = element.pid;
    row.insertCell(1).innerHTML = element.imageName;
    row.insertCell(2).innerHTML = `${(element.memUsage / 1000000).toFixed(
      2
    )} MB`;
  });
};

const updateCpu = (cpuUsage) => {
  let cpu = Math.round(cpuUsage.currentLoad);
  //console.log(cpu);
  //change the progress bar colour
  /*   if (cpu > 85) {
    cpuProgress.classList.add("bg-danger");
  } else if (cpu > 70) {
    cpuProgress.classList.add("bg-warning");
  } else {
    cpuProgress.classList.remove("bg-warning", "bg-danger");
  }

  cpuProgress.style.width = `${cpu}%`;
  cpuHeader.innerText = `Load ${cpu}%`; */
  // Number from 0.0 to 1.0
  cpuBar.animate(cpu / 100);
};

const updateMemory = (memoryUsage) => {
  let memoryUsed = memoryUsage.used / memoryUsage.total;
  /* 
  memoryProgress.style.width = `${memoryUsed * 100}%`;
  memoryHeader.innerText = `Load ${memoryUsed * 100}%`; */
  memoryBar.animate(memoryUsed);
};

ipcRenderer.on("status-success", (e, data) => {
  updateCpu(data.cpuUsage);
  updateMemory(data.memoryUsage);
  // updateProcessList(data.processList);
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
