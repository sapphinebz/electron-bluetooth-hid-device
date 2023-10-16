export class Subscription {
  #teardowns = [];
  constructor(teardownOrSubscription) {
    if (teardownOrSubscription) {
      this.add(teardownOrSubscription);
    }
  }

  add(teardownOrSubscription) {
    if (teardownOrSubscription instanceof Subscription) {
      this.#teardowns.push(
        teardownOrSubscription.unsubscribe.bind(teardownOrSubscription)
      );
    } else if (typeof teardownOrSubscription === "function") {
      this.#teardowns.push(teardownOrSubscription);
    }
  }

  unsubscribe() {
    for (const teardown of this.#teardowns) {
      teardown();
    }
    this.#teardowns = [];
  }
}
