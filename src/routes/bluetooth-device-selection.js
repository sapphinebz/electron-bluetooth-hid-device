import { Subscription } from "../ipc-renderer/libs/rxjs-compat/index.js";

const template = document.createElement("template");
template.innerHTML = `
  <h1>Bluetooth Device Selection</h1>
  `;

export class BluetoothDeviceSelection extends HTMLElement {
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

  connectedCallback() {}

  disconnectedCallback() {
    this.subscriptions.unsubscribe();
  }

  adoptedCallback() {}

  attributeChangedCallback(name, oldValue, newValue) {}
}

const selector = "bluetooth-device-selection";
const wc = customElements.get(selector);
if (!wc) {
  customElements.define(selector, BluetoothDeviceSelection);
}
