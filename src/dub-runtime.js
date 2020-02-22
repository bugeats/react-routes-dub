const CallbackRegistry = require('./support/callback-registry');
const RouteTree = require('./route-tree');
const PromiseQueue = require('./support/promise-queue');
const TransitionState = require('./support/transition-state');

// -----------------------------------------------------------------------------

// DubRuntime encapsulates the (private) state of the routes,
// and their current UI state.

class DubRuntime {
  constructor (routesDef = [], config = {}) {
    if (!config.store) {
      throw new Error('DubRuntime needs a store object');
    }

    this.config = config;
    this.routesDef = routesDef;
    this.routeChangeRegistry = new CallbackRegistry();
    this.tree = new RouteTree(routesDef);
    this.store = config.store;
    this.log = config.log;
    this.transitionQueue = new PromiseQueue();
    this.transitionState = new TransitionState();

    this.store.onRoutePathChange(() => {
      this.handleStoreRoutePathChange();
    });

    // initializing is the same thing as responding to a store change
    this.handleStoreRoutePathChange();
  }

  // Public (read) ---------------------

  getCurrentRouteName () {
    return this.transitionState.getCursorName();
  }

  getCurrentRouteContext () {
    return this.transitionState.getCursorContext();
  }

  getRouteMeta (routeName) {
    if (this.tree.has(routeName)) {
      return this.tree.get(routeName).meta;
    }
    return {};
  }

  getRoutePath (routeName, routeContext = {}) {
    if (this.tree.has(routeName)) {
      const path = this.tree.getRoutePath(routeName, routeContext);
      if (path !== '') {
        return path;
      }
    }
    return '/';
  }

  // Public (write) --------------------

  onRouteChange (handlerFn) {
    return this.routeChangeRegistry.register(handlerFn);
  }

  async transitionPathTo (toPath) {
    this.log(`transitioning path to '${toPath}'`);
    const found = this.tree.matchRoutePath(toPath);

    if (found) {
      await this.transitionRouteTo(found.routeName, found.routeContext);
      return true;
    }

    return false;
  }

  async transitionRouteTo (toRouteName, toRouteContext = {}) {
    this.log(`transition to '${toRouteName}' (${JSON.stringify(toRouteContext)})`);

    this.transitionState.setDestination(toRouteName, toRouteContext);

    const currentRouteName = this.getCurrentRouteName();
    if (currentRouteName && currentRouteName !== toRouteName) {
      await this.tree.get(currentRouteName).onExit();
    }

    await this.tick();

    this.log(`transition COMPLETE to '${toRouteName}' (${JSON.stringify(toRouteContext)})`);
  }

  // Private ---------------------------

  // TODO prevent concurrent calls to tick()
  async tick () {
    const cursorName = this.transitionState.getCursorName();
    const destinationName = this.transitionState.getDestinationName();
    const destinationContext = this.transitionState.getDestinationContext();

    if (cursorName === undefined || (cursorName === undefined && destinationName === undefined)) {
      this.transitionState.forceEqual();
      return undefined; // done
    }

    if (this.transitionState.isEqual()) {
      return undefined;
    }

    const next = this.tree.trailNext(cursorName, destinationName);

    if (next) {
      const route = this.tree.get(next.routeName);

      if (next.isDestination) {
        this.log(`ENTER '${route.name}' ${ JSON.stringify(destinationContext) }`);
        await route.onEnter();
        // !!! this is where route landing action happens !!!
        this.transitionState.setDestination(destinationName, destinationContext);
        this.transitionState.forceEqual();
        this.updateStore(destinationName, destinationContext);
        this.routeChangeRegistry.broadcast();
        return this.tick(); // call tick again just in case something changed during async
      }

      if (next.isAscending) {
        this.log(`VISIT (ASC) '${route.name}'`);
        await route.onVisit();
        await route.onVisitAscending();
      } else if (next.isDescending) {
        this.log(`VISIT (DSC) '${route.name}'`);
        await route.onVisit();
        await route.onVisitDescending();
      } else {
        this.log(`VISIT '${route.name}'`);
        await route.onVisit();
      }

      // move forward
      this.transitionState.setCursor(next.routeName);
    }

    return this.tick();
  }

  updateStore (routeName, routeContext) {
    const routePath = this.getRoutePath(routeName, routeContext);
    this.log(`updating store with path '${routePath}'`);
    this.store.setRoutePath(routePath);
  }

  async handleStoreRoutePathChange () {
    const found = this.tree.matchRoutePath(this.store.getRoutePath());

    if (!found) {
      return;
    }

    this.transitionState.setDestination(found.routeName, found.routeContext);
    this.tick();
  }
}

module.exports = DubRuntime;
