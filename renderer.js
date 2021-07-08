const { ipcRenderer } = require("electron");

const cpuProgress = document.getElementById("cpu-progress");
const cpuHeader = document.getElementById("cpu-header");
const memoryProgress = document.getElementById("memory-progress");
const memoryHeader = document.getElementById("memory-header");
let tbody = document.getElementById("tData");

/* const NOTIFICATION_TITLE = "Title";
const NOTIFICATION_BODY =
  "Notification from the Renderer process. Click to log to console.";
const CLICK_MESSAGE = "Notification clicked";

new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY }).onclick =
  () => console.log(CLICK_MESSAGE);
 */
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

  //change the progress bar colour
  if (cpu > 85) {
    cpuProgress.classList.add("bg-danger");
  } else if (cpu > 70) {
    cpuProgress.classList.add("bg-warning");
  } else {
    cpuProgress.classList.remove("bg-warning", "bg-danger");
  }

  cpuProgress.style.width = `${cpu}%`;
  cpuHeader.innerText = `${cpu}%`;
};

const updateMemory = (memoryUsage) => {
  let memoryUsed = Math.round((memoryUsage.used / memoryUsage.total) * 100);

  memoryProgress.style.width = `${memoryUsed}%`;
  memoryHeader.innerText = `${memoryUsed}%`;
};

ipcRenderer.on("status-success", (e, data) => {
  console.log(data.cpuDetails);

  updateCpu(data.cpuUsage);
  updateMemory(data.memoryUsage);
  updateProcessList(data.processList);
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
