module.exports = class CallbackRegistry {
  constructor () {
    this.handlers = new Map();
  }

  register (fn) {
    this.handlers.set(fn, fn);
    const self = this;
    return function deregister () {
      return self.handlers.delete(fn);
    };
  }

  size () {
    return this.handlers.size;
  }

  async broadcast (...args) {
    for (const [, fn] of this.handlers.entries()) {
      await fn(...args);
    }
  }
};
