const { contextBridge } = require("electron");
const { Observable } = require("rxjs");
const { share, shareReplay } = require("rxjs/operators");
const { ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  // we can also expose variables, not just functions
});
