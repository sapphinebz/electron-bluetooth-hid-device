import { Observable } from "./observable.js";

/**
 *
 * @param  {...any} vals
 */
export function of(...vals) {
  return new Observable((subscriber) => {
    for (const val of vals) {
      subscriber.next(val);
    }
    subscriber.complete();
  });
}
