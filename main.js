// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const tasklist = require("tasklist");
const si = require("systeminformation");
const _ = require("lodash");

ipcMain.on("on-load", async (e) => {
  let cpuDetails = await si.cpu();
  let memoryUsage = await si.mem();

  e.sender.send("on-load-success", {
    cpuDetails,
    memoryUsage,
  });
});

ipcMain.on("get-status", async (e) => {
  // let memoryUsage = process.getSystemMemoryInfo();
  let memoryUsage = await si.mem();
  let cpuUsage = await si.currentLoad();
  let processList = await tasklist();
  const sortedList = _.orderBy(processList, ["memUsage"], ["desc"]);
  const topList = _.slice(sortedList, 0, 10);

  e.sender.send("status-success", {
    cpuUsage,
    memoryUsage,
    topList,
  });
});

ipcMain.on("get-processes-list", async (e) => {
  let data = await tasklist();
  e.sender.send("processes-list-success", data);
});

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    minWidth: 350,
    maxWidth: 350,
    minHeight: 750,
    maxHeight: 750,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // and load the index.html of the app.
  mainWindow.loadFile("./renderer/index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
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
