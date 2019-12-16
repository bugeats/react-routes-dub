/* eslint-disable no-unused-vars */

class StoreBase {
  setRoutePath (routePath) {
    throw new Error('store setRoutePath not implemented');
  }

  getRoutePath () {
    throw new Error('store getRoutePath not implemented');
  }

  onRoutePathChange (handlerFn) {
    throw new Error('store onRoutePathChange not implemented');
  }
}

module.exports = StoreBase;
