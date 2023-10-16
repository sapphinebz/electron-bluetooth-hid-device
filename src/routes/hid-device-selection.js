import {
  Subscription,
  fromEvent,
} from "../ipc-renderer/libs/rxjs-compat/index.js";
const template = document.createElement("template");
template.innerHTML = `
<h1>WebHID API</h1>

<button id="clickme">Test WebHID</button>

<h3>
  HID devices automatically granted access via
  <i>setDevicePermissionHandler</i>
</h3>
<div id="granted-devices"></div>

<h3>
  HID devices automatically granted access via <i>select-hid-device</i>
</h3>
<div id="granted-devices2"></div>
`;

export class HIDDeviceSelection extends HTMLElement {
  subscriptions = new Subscription();
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);
    shadowRoot.append(clone);
  }

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    const clickmeEl = this.shadowRoot.querySelector("#clickme");

    this.subscriptions.add(
      fromEvent(clickmeEl, "click").subscribe(async () => {
        const grantedDevices = await navigator.hid.getDevices();
        let grantedDeviceList = "";
        grantedDevices.forEach((device) => {
          grantedDeviceList += `<hr>${device.productName}</hr>`;
        });
        this.shadowRoot.getElementById("granted-devices").innerHTML =
          grantedDeviceList;
        const grantedDevices2 = await navigator.hid.requestDevice({
          filters: [],
        });

        grantedDeviceList = "";
        grantedDevices2.forEach((device) => {
          grantedDeviceList += `<hr>${device.productName}</hr>`;
        });
        this.shadowRoot.getElementById("granted-devices2").innerHTML =
          grantedDeviceList;
      })
    );
  }

  disconnectedCallback() {
    this.subscriptions.unsubscribe();
  }

  adoptedCallback() {}

  attributeChangedCallback(name, oldValue, newValue) {}
}

const selector = "hid-device-selection";
const wc = customElements.get(selector);
if (!wc) {
  customElements.define(selector, HIDDeviceSelection);
}
