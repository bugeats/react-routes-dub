class PromiseQueue {
  constructor () {
    this.dfd = Promise.resolve();
  }

  async do (fn) {
    this.dfd = this.dfd.then(fn);
    return this.dfd;
  }
}

module.exports = PromiseQueue;
