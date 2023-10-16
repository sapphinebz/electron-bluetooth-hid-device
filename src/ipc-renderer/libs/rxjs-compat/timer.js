import { Observable } from "./observable.js";
/**
 *
 * @param {number} period
 * @returns Observable
 */
export function timer(period) {
  return new Observable((subscriber) => {
    const ref = setTimeout(() => {
      subscriber.next(0);
      subscriber.complete();
    }, period);

    subscriber.add(() => clearTimeout(ref));
  });
}
