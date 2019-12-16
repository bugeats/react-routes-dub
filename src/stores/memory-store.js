const StoreBase = require('./store-base');
const CallbackRegistry = require('../support/callback-registry');

class MemoryStore extends StoreBase {
  constructor () {
    super();
    this.value = undefined;
    this.registry = new CallbackRegistry();
  }

  setRoutePath (routePath) {
    const prevValue = this.value;
    this.value = routePath;

    if (this.value !== prevValue) {
      this.registry.broadcast(prevValue);
    }
  }

  getRoutePath () {
    return this.value;
  }

  onRoutePathChange (handlerFn) {
    return this.registry.register(handlerFn);
  }
}

module.exports = MemoryStore;
