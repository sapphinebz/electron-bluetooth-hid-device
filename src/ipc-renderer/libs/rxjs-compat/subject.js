import { Observable } from "./observable.js";
export class Subject extends Observable {
  #subscriberList = [];
  constructor() {
    super((subscriber) => {
      this.#subscriberList.push(subscriber);
      subscriber.add(() => {
        const index = this.#subscriberList.findIndex((sb) => sb === subscriber);
        if (index > -1) {
          this.#subscriberList.splice(index, 1);
        }
      });
    });
  }

  next(value) {
    if (this.closed) return;
    for (const sb of this.#subscriberList) {
      sb.next(value);
    }
  }

  complete() {
    if (this.closed) return;
    const subscriberList = [...this.#subscriberList];
    for (const sb of subscriberList) {
      sb.complete();
    }
    this.#closeObservable();
  }

  error(_error) {
    if (this.closed) return;
    const subscriberList = [...this.#subscriberList];
    for (const sb of subscriberList) {
      sb.error(_error);
    }
    this.#closeObservable();
  }

  #closeObservable() {
    this.#subscriberList = null;
    this.closeObservable();
  }
}
