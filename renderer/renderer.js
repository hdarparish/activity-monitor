const { ipcRenderer } = require("electron");
const ProgressBar = require("progressbar.js");
const setting = require("./setting.js");

let cpuSection = document.getElementById("cpu-section");
let memorySection = document.getElementById("memory-section");
let processSection = document.getElementById("process-section");
let settingsSection = document.getElementById("settings-section");
let tbody = document.getElementById("tData");
let refreshRate = document.getElementById("usage-refresh");
let cpuThreshold = document.getElementById("cpu-threshold");
let cpuNotification = document.getElementById("notification");

let cpu;

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

  //update the form with stored data
  refreshRate.value = setting.storage.refreshRate;
  cpuThreshold.value = setting.storage.threshold * 100;
  cpuNotification.value = setting.storage.notification;
});

//update the CPU and RAM status
setInterval((e) => {
  ipcRenderer.send("get-status");
}, setting.storage.refreshRate);

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

//send CPU usage notification
const sendNotification = () => {
  const NOTIFICATION_TITLE = "CPU";
  const NOTIFICATION_BODY = `CPU usage at ${Math.round(cpu * 100)}%`;
  //send notification
  new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY });
};

// Check how much time has passed since notification
const checkFrequency = () => {
  if (setting.storage.lastNotification == 0) {
    // Store timestamp
    setting.storage.lastNotification = +new Date();
    return true;
  }
  const notifyTime = new Date(parseInt(setting.storage.lastNotification));

  const now = new Date();
  const diffTime = Math.abs(now - notifyTime);
  const minutesPassed = Math.ceil(diffTime / (1000 * 60));
  if (minutesPassed > setting.storage.notificationFrequency) {
    setting.storage.lastNotification = +new Date();
    return true;
  } else {
    return false;
  }
};

const updateCpu = (cpuUsage) => {
  cpu = Math.round(cpuUsage.currentLoad) / 100;
  cpuBar.animate(cpu);

  if (cpu >= setting.storage.threshold && checkFrequency()) {
    sendNotification();
  }
};

const updateMemory = (memoryUsage) => {
  let memoryUsed = memoryUsage.used / memoryUsage.total;
  memoryBar.animate(memoryUsed);
};

//onload show CPU model and total RAM
ipcRenderer.on("on-load-success", (e, data) => {
  let cpuModel = document.getElementById("cpu-model");
  cpuModel.innerText = `${data.cpuDetails.manufacturer} ${data.cpuDetails.brand} @ ${data.cpuDetails.speed} GHz`;

  //memory details
  let memoryType = document.getElementById("memory-type");
  memoryType.innerText = `${Math.round(
    data.memoryUsage.total / 1000000000
  )} GB`;
});

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

const saveSetting = (event) => {
  event.preventDefault();
  setting.storage.refreshRate = refreshRate.value;
  setting.storage.threshold = cpuThreshold.value / 100;
  setting.storage.notificationFrequency = cpuNotification.value;
  setting.save();
  alert("Setting Saved");
  location.reload();
};
