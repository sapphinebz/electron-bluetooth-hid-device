import { Observable } from "../observable.js";

/**
 *
 * @param {Function} project
 */
export function map(project) {
  return (source) =>
    new Observable((subscriber) => {
      const subscription = source.subscribe({
        next: (val) => subscriber.next(project(val)),
        error: subscriber.error.bind(subscriber),
        complete: subscriber.complete.bind(subscriber),
      });

      subscriber.add(subscription);
    });
}
