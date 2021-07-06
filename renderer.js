const { ipcRenderer } = require("electron");

const cpuProgress = document.getElementById("cpu-progress");
const cpuHeader = document.getElementById("cpu-header");
const memoryProgress = document.getElementById("memory-progress");
const memoryHeader = document.getElementById("memory-header");

/* const NOTIFICATION_TITLE = "Title";
const NOTIFICATION_BODY =
  "Notification from the Renderer process. Click to log to console.";
const CLICK_MESSAGE = "Notification clicked";

new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY }).onclick =
  () => console.log(CLICK_MESSAGE);
 */
setInterval((e) => {
  ipcRenderer.send("get-cpu-status");
}, 1000);

ipcRenderer.on("cpu-status-success", (e, data) => {
  //to prevent from being 0%
  let cpu = Math.round(data.cpuUsage.percentCPUUsage * 100) || 5;
  let memoryTotal = data.memoryUsage.total / 1000000;
  let memoryUsed = (memoryTotal - data.memoryUsage.free / 1000000).toFixed(1);

  if (cpu > 50 && cpu < 75) {
    cpuProgress.classList.add("bg-warning");
  } else if (cpu > 75) {
    cpuProgress.classList.add("bg-danger");
  } else {
    cpuProgress.classList.remove("bg-warning", "bg-danger");
  }

  cpuProgress.setAttribute("aria-valuenow", "100");
  cpuProgress.style.width = `${cpu}%`;
  cpuHeader.innerText = `${cpu > 100 ? 100 : cpu}%`;

  memoryProgress.style.width = `${(memoryUsed / memoryTotal) * 100}%`;
  memoryHeader.innerText = `${memoryUsed} GB / ${memoryTotal.toFixed(1)} GB`;

  // cpuProgress["aria-valuenow"] = 100;
  //console.log(data);
});
