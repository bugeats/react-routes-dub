const pathToRegexp = require('path-to-regexp');
const BoundHistory = require('./bound-history');

module.exports = function routesDub (options = {}, routes = []) {
  const { React } = options;

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

  const { Provider, Consumer } = options.React.createContext();

  // ----

  class DubProvider extends React.Component {
    constructor (props) {
      super(props);
      this.state = {};
      boundHistory.onPathChange(() => {
        this.setState({
          currentPath: boundHistory.getCurrentPath()
        });
      });
    }

    render () {
      return React.createElement(Provider, { value: this.state.currentPath }, this.props.children);
    }
  }

  // ----

  function pathFor (name, params = {}) {
    const found = routesCompiledByName[name];
    if (found) {
      return found.toPath(params);
    }
    return '';
  }

  // ----

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

  // ----

  function Route ({ children, is }) {
    return React.createElement(Consumer, {}, () => {
      const currentRoute = getCurrentRoute();
      if (currentRoute && currentRoute.name === is) {
        return children;
      }
      return null;
    });
  }

  return {
    Link,
    DubProvider,
    Route,
    pathFor
  };
};

// -----------------------------------------------------------------------------

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

  const regexp = pathToRegexp(pattern);
  const toPath = pathToRegexp.compile(pattern);

  return {
    name,
    pattern,
    regexp,
    toPath
  };
}

function compileRoutes (routes, parent = undefined) {
  return routes.reduce((accu, route) => {
    const routeX = expandRoute(route, parent);
    accu.push(routeX);
    if (route.routes) {
      accu = accu.concat(compileRoutes(route.routes, routeX)); // RECUR
    }
    return accu;
  }, []);
}
