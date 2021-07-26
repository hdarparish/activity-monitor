const { ipcRenderer } = require("electron");
const ProgressBar = require("progressbar.js");
const _ = require("lodash");
const { cpu } = require("systeminformation");

let cpuSection = document.getElementById("cpu-section");
let memorySection = document.getElementById("memory-section");
let processSection = document.getElementById("process-section");
let settingsSection = document.getElementById("settings-section");
let tbody = document.getElementById("tData");

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

//after the page loads communicate to main process, hide the settings section
window.addEventListener("load", (e) => {
  ipcRenderer.send("on-load");

  //hide settings
  settingsSection.style.display = "none";
});

ipcRenderer.on("on-load-success", (e, data) => {
  console.log(data);
  let cpuModel = document.getElementById("cpu-model");
  cpuModel.innerText = `${data.cpuDetails.manufacturer} ${data.cpuDetails.brand} @ ${data.cpuDetails.speed} GHz`;

  //memory details
  let memoryType = document.getElementById("memory-type");
  memoryType.innerText = `${Math.round(
    data.memoryUsage.total / 1000000000
  )} GB`;
});

//update the cpu status every 1 second
setInterval((e) => {
  ipcRenderer.send("get-status");
}, 5000);

const updateProcessList = (processList) => {
  tbody.innerHTML = "";

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

const viewSettings = (e) => {
  cpuSection.classList.add("hide");
  memorySection.classList.add("hide");
  processSection.classList.add("hide");
  settingsSection.style.display = "flex";
};

const viewStatus = (e) => {
  cpuSection.classList.remove("hide");
  memorySection.classList.remove("hide");
  processSection.classList.remove("hide");
  settingsSection.style.display = "none";
};
