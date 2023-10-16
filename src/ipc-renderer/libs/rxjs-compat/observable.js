import { Subscription } from "./subscription.js";
export class Observable {
  #project;
  subscriptions = new Subscription();
  closed = false;
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
      if (!this.closed) {
        this.subscriptions.unsubscribe();
        this.closed = true;
      }
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

  #mergeSafeSubscriber(source, target) {
    return { ...source, ...target };
  }

  #createSafeSubscriber() {
    return {
      next: () => {},
      error: () => {},
      complete: () => {},
      add: this.subscriptions.add.bind(this.subscriptions),
    };
  }
}
