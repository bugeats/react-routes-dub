const React = require('react');
const pathToRegexp = require('path-to-regexp');
const BoundHistory = require('./bound-history');

module.exports = function routesDub (routes = []) {
  const routesCompiled = compileRoutes(routes);
  const routesCompiledByName = routesCompiled.reduce((accu, route) => {
    accu[route.name] = route;
    return accu;
  }, {});

  const boundHistory = new BoundHistory();

  // TODO cache this
  function getCurrentRoute () {
    const path = boundHistory.getCurrentPath();
    return routesCompiled.find((route) => {
      return route.regexp.exec(path);
    });
  }

  const { Provider, Consumer } = React.createContext();

  // instead of exposing the entire current route details,
  // just use 'context' as the public data exposed all over the place.
  function getCurrentContext () {
    const currentRoute = getCurrentRoute();

    if (!currentRoute) {
      return {
        isUnmatched: true,
        name: null,
        params: {},
        meta: {},
        path: boundHistory.getCurrentPath()
      };
    }

    // TODO eliminate need to call exec twice
    const path = boundHistory.getCurrentPath();
    const result = currentRoute.regexp.exec(path);
    const meta = currentRoute.meta || {};
    const params = currentRoute.keys.reduce((accu, key, idx) => {
      accu[key.name] = result[idx + 1];
      return accu;
    }, {});

    // this is the public facing context
    return {
      name: currentRoute.name,
      params,
      meta,
      path
    };
  }

  const onContextChangeListeners = [];

  function onContextChange (callbackFn) {
    if (isFunction(callbackFn)) {
      onContextChangeListeners.push(callbackFn);
    }
  }

  function handlePathChange () {
    // handle route enter events
    const currentRoute = getCurrentRoute();
    if (currentRoute && currentRoute.onEnter) {
      currentRoute.onEnter(getCurrentContext());
    }

    // handle any on change listeners
    onContextChangeListeners.forEach(fn => fn(getCurrentContext()));
  }

  boundHistory.onPathChange(handlePathChange);

  // ---- Public Helper Functions ----

  function pathFor (name, params = {}) {
    const found = routesCompiledByName[name];
    if (found) {
      return found.toPath(params);
    }
    return '';
  }

  function routeTo (name, params = {}) {
    const foundRoute = routesCompiledByName[name];
    if (!foundRoute) throw new Error(`no route by name '${ name }'`);

    const path = params ? foundRoute.toPath(params) : foundRoute.pattern;
    boundHistory.pushPath(path);
  }


  // ---- Public React Components ----

  class DubProvider extends React.Component {
    constructor (props) {
      super(props);
      this.state = {
        context: getCurrentContext()
      };
      boundHistory.onPathChange(() => {
        this.setState({
          context: getCurrentContext()
        });
      });
    }

    componentDidMount () {
      handlePathChange(); // routes init counts as a path change
    }

    render () {
      return React.createElement(Provider, { value: this.state.context }, this.props.children);
    }
  }

  function Link ({ children, to, params }) {
    const foundRoute = routesCompiledByName[to];
    if (!foundRoute) throw new Error(`no route by name '${ to }'`);

    const path = params ? foundRoute.toPath(params) : foundRoute.pattern;

    return React.createElement('a', {
      href: path,
      onClick: (evt) => {
        evt.preventDefault();
        boundHistory.pushPath(path);
      }
    }, children);
  }

  function Route ({ children, is, unmatched, not }) {
    return React.createElement(Consumer, {}, (context) => {
      const wantsUnmatched = (unmatched === true) && context.isUnmatched;
      const wantsAny = (is === undefined) && (unmatched === undefined) && (not === undefined);
      const isMatch = contains(is, context.name);
      const isMatchNot = (not !== undefined) && !contains(not, context.name);

      const routeChild = isFunction(children)
        ? React.createElement(Consumer, {}, children)
        : children;

      if (wantsUnmatched) {
        return routeChild;
      }

      if (isMatchNot) {
        return routeChild;
      }

      if (isMatch) {
        return routeChild;
      }

      if (wantsAny) {
        return routeChild;
      }

      return null;
    });
  }

  // ----

  return {
    DubProvider,
    Link,
    Route,
    getCurrentContext,
    onContextChange,
    pathFor,
    routeTo
  };
};

// Supporting Private Functions ------------------------------------------------

function normalizePattern (pattern) {
  return '/' + pattern
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
}

function expandRoute (route, parent) {
  const name = parent
    ? [parent.name, route.name].join('.')
    : route.name;

  const pattern = parent
    ? [parent.pattern, route.pattern].map(normalizePattern).join('')
    : normalizePattern(route.pattern);

  const keys = [];
  const regexp = pathToRegexp(pattern, keys);
  const toPath = pathToRegexp.compile(pattern);

  const onEnter = (route.onEnter && isFunction(route.onEnter))
    ? route.onEnter
    : undefined;

  // meta properties cascade to children
  const meta = Object.assign({}, (parent ? parent.meta : {}), route.meta);

  return {
    keys,
    meta,
    name,
    onEnter,
    pattern,
    regexp,
    toPath
  };
}

function compileRoutes (routes = [], parent = undefined) {
  return routes.reduce((accu, route) => {
    const routeX = expandRoute(route, parent);
    accu.push(routeX);
    if (route.routes) {
      accu = accu.concat(compileRoutes(route.routes, routeX)); // RECUR
    }
    return accu;
  }, []);
}

function forceToArray (obj) {
  if (obj === undefined) return [];
  if (obj === null) return [];
  return Array.isArray(obj) ? obj : [obj];
}

function contains (arr, obj) {
  for (const item of forceToArray(arr)) {
    if (item === obj) {
      return true;
    }
  }
  return false;
}

function isFunction (obj) {
  return obj && {}.toString.call(obj) === '[object Function]';
}
