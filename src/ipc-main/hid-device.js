const { Observable, merge, EMPTY } = require("rxjs");
const { switchMap, take, tap } = require("rxjs/operators");
/**
 *
 * @param {BrowserWindow} mainWindow
 * @returns Observable
 */
function onRequestHIDDevice(mainWindow) {
  return new Observable((subscriber) => {
    const ss = mainWindow.webContents.session;
    const handler = (event, details, callback) => {
      subscriber.next({ event, details, callback });
    };
    ss.on("select-hid-device", handler);
    subscriber.add(ss.off.bind(ss, ("select-hid-device", handler)));

    ss.setPermissionCheckHandler(
      (webContents, permission, requestingOrigin, details) => {
        if (permission === "hid" && details.securityOrigin === "file:///") {
          return true;
        }
      }
    );
    subscriber.add(ss.setPermissionCheckHandler.bind(ss, null));

    ss.setDevicePermissionHandler((details) => {
      if (
        details.deviceType === "hid" &&
        details.origin === "file://" &&
        details.device.name === "Headset"
      ) {
        //   console.log(details);
        return true;
      }
    });
    subscriber.add(ss.setDevicePermissionHandler.bind(ss, null));
  });
}

/**
 *
 * @param {BrowserWindow} mainWindow
 * @returns Observable
 */
function selectHIDDevice(mainWindow) {
  return onRequestHIDDevice(mainWindow).pipe(
    switchMap(({ event, details, callback }) => {
      const ss = mainWindow.webContents.session;
      event.preventDefault();

      const headset = details.deviceList.find((d) => d.name === "Headset");
      if (headset && details.deviceList && details.deviceList.length > 0) {
        // callback(details.deviceList[0].deviceId);
        callback(headset.deviceId);
        return EMPTY;
      }

      const onHIDDeviceAdded = new Observable((subscriber) => {
        const handler = (event, device) => {
          console.log("hid-device-added FIRED WITH", device);
          subscriber.next({ event, device });
        };
        ss.on("hid-device-added", handler);
        subscriber.add(ss.off.bind("hid-device-added", handler));
      });

      const onHIDDeviceRemoved = new Observable((subscriber) => {
        const handler = (event, device) => {
          console.log("hid-device-removed FIRED WITH", device);
          subscriber.next({ event, device });
        };
        ss.on("hid-device-removed", handler);
        subscriber.add(ss.off.bind("hid-device-removed", handler));
      });
      return merge(onHIDDeviceAdded, onHIDDeviceRemoved).pipe(
        tap(({ event, device }) => {
          callback(device.deviceId);
        }),
        take(1)
      );
    })
  );
}

module.exports = {
  onRequestHIDDevice,
  selectHIDDevice,
};
