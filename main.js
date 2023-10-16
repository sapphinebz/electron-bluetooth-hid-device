const { app, BrowserWindow, ipcMain } = require("electron");
const { fromEvent, merge, EMPTY, Observable } = require("rxjs");
const path = require("node:path");
const {
  shareReplay,
  switchMap,
  share,
  filter,
  tap,
  map,
  take,
  switchAll,
} = require("rxjs/operators");

const { selectHIDDevice } = require("./src/ipc-main/hid-device.js");

const onAppReady = fromEvent(app, "ready").pipe(shareReplay(1));
const onAppActivate = onAppReady.pipe(
  switchMap(() => fromEvent(app, "activate")),
  share()
);

const onAppActivateZeroWindows = onAppActivate.pipe(
  filter(() => BrowserWindow.getAllWindows().length === 0),
  share()
);

const onBrowserWindowReady = merge(onAppReady, onAppActivateZeroWindows).pipe(
  switchMap(() => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true,
      },
    });

    win.webContents.openDevTools({ mode: "detach", title: "DEV TOOLS" });
    return merge(
      win.loadFile("index.html").then(() => win),
      failLoadNavigateTo(win, "index.html").pipe(map(() => win))
    );
  }),
  shareReplay(1)
);

onBrowserWindowReady.pipe(switchMap((win) => selectHIDDevice(win))).subscribe();

onAppReady.subscribe(() => {
  ipcMain.handle("testInvoke", (event, args) => {
    console.log(event, args);
    return "xxx";
  });
});

// onBrowserWindowReady.pipe(switchMap((win) => selectHIDDevice(win))).subscribe();

// onBrowserWindowReady.subscribe((win) => {
//   fromEvent(
//     win.webContents,
//     "select-bluetooth-device",
//     (event, deviceList, callback) => {
//       console.log(event);
//       console.log("-----");
//       console.log(deviceList);
//       console.log("----");
//       console.log(callback);
//       return event;
//     }
//   ).subscribe();

//   win.webContents.session.setBluetoothPairingHandler((details, callback) => {
//     console.log(details);
//     // bluetoothPinCallback = callback;
//     // Send a message to the renderer to prompt the user to confirm the pairing.
//     // win.webContents.send("bluetooth-pairing-request", details);
//   });
// });

fromEvent(app, "window-all-closed").subscribe(() => {
  if (process.platform !== "darwin") app.quit();
});

onBrowserWindowReady.subscribe();

/**
 * @param {BrowserWindow} win
 * @param {string} redirectPath
 * @returns Observable<>
 */
function failLoadNavigateTo(win, redirectPath) {
  return fromEvent(
    win.webContents,
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.error(`Failed to load URL: ${errorDescription}`);
      const url = new URL(win.webContents.getURL());

      return win.loadFile(redirectPath, { hash: `${url.pathname}` });
    }
  ).pipe(switchAll());
}
