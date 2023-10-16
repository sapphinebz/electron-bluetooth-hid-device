import { Observable } from "./observable.js";
/**
 *
 * @param {Element} el
 * @param {string} eventName
 * @returns Observable
 */
export function fromEvent(el, eventName) {
  return new Observable((subscriber) => {
    const handler = subscriber.next.bind(subscriber);
    el.addEventListener(eventName, handler);
    subscriber.add(el.removeEventListener.bind(el, eventName, handler));
  });
}
