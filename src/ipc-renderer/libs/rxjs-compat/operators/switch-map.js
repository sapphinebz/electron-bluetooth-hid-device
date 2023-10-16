import { Observable } from "../observable.js";

/**
 *
 * @param {Function} projectObservable
 */
export function switchMap(projectObservable) {
  return (source) =>
    new Observable((subscriber) => {
      let innerSubscription = null;
      let outerCompleted = false;
      let innerCompleted = false;
      const checkCompletion = () => {
        if (outerCompleted && innerCompleted) {
          subscriber.complete();
        }
      };
      const subscription = source.subscribe({
        next: (val) => {
          if (innerSubscription) {
            innerSubscription.unsubscribe();
          }
          const innerObservable = projectObservable(val);
          innerSubscription = innerObservable.subscribe({
            next: subscriber.next.bind(subscriber),
            error: subscriber.error.bind(subscriber),
            complete: () => {
              innerCompleted = true;
              checkCompletion();
            },
          });
        },
        error: subscriber.error.bind(subscriber),
        complete: () => {
          outerCompleted = true;
          checkCompletion();
        },
      });

      subscriber.add(() => {
        subscription.unsubscribe();
        if (innerSubscription) {
          innerSubscription.unsubscribe();
          innerSubscription = null;
        }
      });
    });
}
