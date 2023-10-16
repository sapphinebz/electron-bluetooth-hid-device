import { Subscription } from "./subscription.js";
export class Observable {
  #project;
  subscriptions = new Subscription();
  closed = false;
  completed = false;
  constructor(project) {
    this.#project = project;
  }
  subscribe(observer) {
    if (!this.closed) {
      let safeSubscriber = this.#createSafeSubscriber();
      if (typeof observer === "function") {
        safeSubscriber.next = observer;
      } else {
        safeSubscriber = this.#mergeSafeSubscriber(safeSubscriber, observer);
      }
      this.#project(safeSubscriber);
    } else {
      console.warn("Observable is closed!");
    }

    return new Subscription(() => {
      this.closeObservable();
    });
  }

  /**
   *
   * @param  {...Function} opts
   * @returns Observable
   */
  pipe(...opts) {
    return opts.reduce((observable, operator) => operator(observable), this);
  }

  #mergeSafeSubscriber(safeSubscriber, target) {
    return {
      next: target.next ?? safeSubscriber.next,
      error: target.error ?? safeSubscriber.error,
      complete: target.complete
        ? () => {
            safeSubscriber.complete();
            target.complete();
          }
        : safeSubscriber.complete,
      add: safeSubscriber.add.bind(safeSubscriber),
    };
  }

  #createSafeSubscriber() {
    return {
      next: () => {},
      error: () => {},
      complete: () => {
        this.completed = true;
        this.subscriptions.unsubscribe();
      },
      add: this.subscriptions.add.bind(this.subscriptions),
    };
  }

  closeObservable() {
    if (!this.closed) {
      this.subscriptions.unsubscribe();
      this.closed = true;
    }
  }
}
