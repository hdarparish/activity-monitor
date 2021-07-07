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
  ipcRenderer.send("get-cpu-status");
}, 1000);

setInterval((e) => {
  ipcRenderer.send("get-processes-list");
}, 10000);

ipcRenderer.on("cpu-status-success", (e, data) => {
  //to prevent from being 0%
  let cpu = Math.round(data.cpuUsage.currentLoad);
  let memoryUsed = Math.round(
    (data.memoryUsage.used / data.memoryUsage.total) * 100
  );

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

  memoryProgress.style.width = `${memoryUsed}%`;
  memoryHeader.innerText = `${memoryUsed}%`;
});

ipcRenderer.on("processes-list-success", (e, data) => {
  tbody.innerHTML = "";
  data.sort(function (a, b) {
    return a.memUsage - b.memUsage;
  });
  data.forEach((element) => {
    let row = tbody.insertRow(0);
    row.insertCell(0).innerHTML = element.pid;
    row.insertCell(1).innerHTML = element.imageName;
    row.insertCell(2).innerHTML = `${(element.memUsage / 1000000).toFixed(
      2
    )} MB`;
  });
});
