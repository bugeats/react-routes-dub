const pathToRegexp = require('path-to-regexp');

// RouteTree -------------------------------------------------------------------

// TODO memoize most of this (MemoCache doesn't seem to be working)

class RouteTree {
  constructor (routesDef) {
    this.flatList = compileFlatList(routesDef);
    this.flatIndex = indexFlatList(this.flatList);
  }

  has (routeName) {
    return !!this.flatList[this.flatIndex[routeName]];
  }

  get (routeName) {
    const foundIdx = this.flatIndex[routeName];
    if (foundIdx === undefined) {
      throw new Error(`no route found by name '${routeName}'`);
    }
    return this.flatList[foundIdx];
  }

  // Find the next item in the "trail" to the destination.
  // This is done one-at-a-time so that the trail may be interrupted mid-walk.
  trailNext (startRouteName, destRouteName) {
    if (startRouteName === destRouteName) {
      return undefined; // there is no next step
    }

    const ascList = [startRouteName, ...this.get(startRouteName).ancestors];
    const dscList = [destRouteName, ...this.get(destRouteName).ancestors];

    let apexName;
    let ascIdx = 0;
    let dscIdx = 0;

    // TODO turn this routine into a cached method
    for (ascIdx = 0; ascIdx < ascList.length; ascIdx++) {
      const ascName = ascList[ascIdx];
      for (dscIdx = 0; dscIdx < dscList.length; dscIdx++) {
        const dscName = dscList[dscIdx];
        if (ascName === dscName) {
          apexName = ascName; // found the apex
          break;
        }
      }
      if (apexName) {
        break;
      }
    }

    // start with any amount of ascension
    if (ascIdx > 0) {
      if (ascIdx === 1) {
        // next step (1 away) is indeed the apex
        // but the apex might also be the destination
        if (apexName === destRouteName) {
          return { routeName: destRouteName, isDestination: true };
        }
        if (apexName === undefined) {
          // undefined apex with an ascension of 1 means we hit the (virtual) root,
          // so it's time to grab the first descendant
          const routeName = dscList[dscIdx - 1];
          if (routeName === destRouteName) {
            return { routeName, isDestination: true };
          }
          return { routeName, isDescending: true };
        }
        return { routeName: ascList[ascIdx], isApex: true };
      }
      // next step is not the apex so we're still ascending
      return { routeName: ascList[1], isAscending: true };
    }

    // no ascension only means one thing: descension
    if (dscIdx === 1 && (dscList[dscIdx - 1] === destRouteName)) {
      // next step (1 away) is indeed the destination
      return { routeName: dscList[dscIdx - 1], isDestination: true };
    }

    return { routeName: dscList[dscIdx - 1], isDescending: true };
  }

  getRoutePath (routeName, routeContext = {}) {
    try {
      return this.get(routeName).contextCompiler(routeContext);
    } catch (err) {
      throw new Error(`problem generating path for route '${routeName}': ${err.message}`);
    }
  }

  matchRoutePath (routePath) {
    for (const route of this.flatList) {
      if (route.regexp.exec(routePath) !== null) {
        const keys = []; // keys is MUTATED by pathToRegexp
        // this is what happens when you mutate, kids.
        const result = pathToRegexp.pathToRegexp(route.pattern, keys).exec(routePath);
        const routeContext = keys.reduce((accu, key, idx) => {
          accu[key.name] = result[idx + 1];
          return accu;
        }, {});

        return {
          routeName: route.name,
          routeContext
        };
      }
    }
    return undefined;
  }
}

// -----------------------------------------------------------------------------

function compileFlatList (routesDef) {
  const rootRoute = { routes: routesDef, isRoot: true };
  const rootAccu = { name: undefined, pattern: undefined, meta: {}, ancestors: [] };

  return (function recur (accu, route) {
    const { routes, ...childlessRoute } = route; // eslint-disable-line no-unused-vars
    const patternX = normalizePattern(route.pattern || nameToPattern(route.name));
    const meta = { ...accu.meta, ...route.meta || {} };
    const parent = accu.name;

    if (!route.isRoot) {
      assertValidRouteName(route.name);
    }

    const name = accu.name
      ? `${accu.name}.${route.name}`
      : route.name;

    const pattern = accu.pattern
      ? normalizePattern(`${accu.pattern}${patternX}`)
      : normalizePattern(patternX);

    const ancestors = parent
      ?  [parent, ...accu.ancestors] // ancestors are in ascending order of distance
      : accu.ancestors;

    const accuNext = { name, pattern, meta, ancestors };

    const descendantsX = (routes || [])
      .map(routeNext => recur(accuNext, routeNext))
      .flat();

    const children = descendantsX
      .filter(x => x.parent === name)
      .map(x => x.name);

    const flatRoute = {
      ...childlessRoute,
      name,
      pattern,
      meta,
      parent,
      ancestors,
      children,
      descendants: descendantsX.map(x => x.name),
      regexp: pathToRegexp.pathToRegexp(pattern),
      contextCompiler: pathToRegexp.compile(pattern),
      onEnter: route.onEnter || noop,
      onExit: route.onExit || noop,
      onVisit: route.onVisit || noop,
      onVisitAscending: route.onVisitAscending || noop,
      onVisitDescending: route.onVisitDescending || noop
    };

    return [
      flatRoute,
      ...descendantsX.flat()
    ];
  }(rootAccu, rootRoute)).slice(1); // slice the root off
}

function indexFlatList (flatList) {
  return flatList.reduce((accu, x, idx) => {
    return {
      ...accu,
      [x.name]: idx
    };
  }, {});
}

function assertValidRouteName (routeName) {
  if (routeName === undefined || typeof routeName !== 'string') {
    throw new Error('route name must be defined');
  }
  if (routeName.match(/\./g)) {
    throw new Error(`invalid route name: '${routeName}'`);
  }
}

async function noop () {
  return undefined;
}

function normalizePattern (pattern = '') {
  // remove trailing slashes
  return pattern.replace(/\/+$/, '');
}

function nameToPattern (name = '') {
  return '/' + normalizePattern(name);
}

// -----------------------------------------------------------------------------

module.exports = RouteTree;
