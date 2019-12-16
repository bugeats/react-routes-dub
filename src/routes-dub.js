const React = require('react');

const DubRuntime = require('./dub-runtime');
const WindowLocationStore = require('./stores/window-location-store');
const argSmoosher = require('./support/arg-smoosher');
const injectLink = require('./components/inject-link');
const injectRoute = require('./components/inject-route');
const injectRouteProvider = require('./components/inject-route-provider');
const injectUseCurrentRoute = require('./hooks/inject-use-current-route');

// This is the main function that takes a routes config
// and returns API methods that are bound to a unique instance of DubRuntime.

function routesDub (...args) {
  const { obj: configX, list: routesDef } = argSmoosher(args);

  const config = {
    store: new WindowLocationStore(),
    log: (typeof console !== 'undefined' && console.log) ? console.log : new Function(),
    ...configX
  };

  const runtime = new DubRuntime(routesDef, config);

  const reactContext = React.createContext();
  const useCurrentRoute = injectUseCurrentRoute(reactContext);

  const api = {
    // ---- read ----
    Link: injectLink(runtime),
    Route: injectRoute(runtime, reactContext),
    RouteProvider: injectRouteProvider(runtime, reactContext),
    getCurrentRouteContext: runtime.getCurrentRouteContext.bind(runtime),
    getCurrentRouteName: runtime.getCurrentRouteName.bind(runtime),
    getRouteMeta: runtime.getRouteMeta.bind(runtime),
    getRoutePath: runtime.getRoutePath.bind(runtime),
    useCurrentRoute,

    // ---- write ----
    onRouteChange: runtime.onRouteChange.bind(runtime),
    transitionRouteTo: runtime.transitionRouteTo.bind(runtime),
    transitionPathTo: runtime.transitionPathTo.bind(runtime)
  };

  return api;
}

module.exports = routesDub;
