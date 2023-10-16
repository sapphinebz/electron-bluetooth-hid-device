import { HIDDeviceSelection } from "./routes/hid-device-selection.js";
import { BluetoothDeviceSelection } from "./routes/bluetooth-device-selection.js";
import { fromEvent } from "./ipc-renderer/libs/rxjs-compat/index.js";
const APP_ROUTES = [
  {
    path: "",
    redirectTo: "/hid",
  },
  {
    path: "/hid",
    component: HIDDeviceSelection,
  },
  {
    path: "/bluetooth",
    component: BluetoothDeviceSelection,
  },
];
export const Router = {
  init: () => {
    const routerLinks = document.querySelectorAll("a[aria-label=routerLink]");
    for (const link of routerLinks) {
      fromEvent(link, "click").subscribe((event) => {
        event.preventDefault();
        const route = event.target.getAttribute("href");
        Router.go(route);
      });

      fromEvent(window, "popstate").subscribe((event) => {
        console.log("popstate");
        Router.go(event.state.route, false);
      });
    }

    if (location.hash) {
      Router.go(location.hash.replace("#", ""));
    } else {
      Router.go(location.pathname);
    }
  },
  go: (route, addToHistory = true) => {
    const main = document.querySelector("main");
    main.innerHTML = "";
    for (const _route of APP_ROUTES) {
      if (route.includes("index.html") && _route.path === "") {
        route = _route.redirectTo;
        continue;
      } else if (route === _route.path) {
        main.appendChild(new _route.component());
        break;
      }
    }

    if (addToHistory) {
      history.pushState({ route }, null, route);
    }
    console.log(location.pathname);
    window.scrollX = 0;
    window.scrollY = 0;
  },
};
