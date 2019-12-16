const StoreBase = require('./store-base');
const CallbackRegistry = require('../support/callback-registry');

class WindowLocationStore extends StoreBase {
  constructor () {
    super();

    this.registry = new CallbackRegistry();

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        this.registry.broadcast();
      });
    }
  }

  setRoutePath (routePath) {
    const prevRoutePath = this.getRoutePath();

    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', routePath);
    }

    // only broadcast actual changes
    if (this.getRoutePath() !== prevRoutePath) {
      // only broadcast if the path value is actually different
      this.registry.broadcast();
    }
  }

  getRoutePath () {
    if (typeof window !== 'undefined') {
      return window.location.href.substr(window.location.origin.length);
    }

    return undefined;
  }

  // register a callback
  onRoutePathChange (handlerFn) {
    return this.registry.register(handlerFn);
  }
}

module.exports = WindowLocationStore;
