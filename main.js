// Modules to control application life and create native browser window
const { app, BrowserWindow, getCPUUsage, ipcMain } = require("electron");
const tasklist = require("tasklist");
const si = require("systeminformation");
const path = require("path");
const { ipcRenderer } = require("electron/renderer");

(async () => {
  /*
  [{
      imageName: 'taskhostex.exe',
      pid: 1820,
      sessionName: 'Console',
      sessionNumber: 1,
      memUsage: 4415488
  }, …]
  */
})();
/* si.cpu()
  .then((data) => console.log(data))
  .catch((error) => console.error(error)); */

ipcMain.on("get-status", async (e) => {
  // let memoryUsage = process.getSystemMemoryInfo();
  let memoryUsage = await si.mem();
  let cpuUsage = await si.currentLoad();
  let cpuDetails = await si.cpu();
  let processList = await tasklist();

  e.sender.send("status-success", {
    cpuUsage,
    memoryUsage,
    cpuDetails,
    processList,
  });
});

ipcMain.on("get-processes-list", async (e) => {
  let data = await tasklist();
  e.sender.send("processes-list-success", data);
});

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
