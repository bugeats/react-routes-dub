const React = require('react');

function injectRoute (dubRuntime, reactContext) {
  return function Route ({
    // TODO use a query engine hook for all these filters
    children,
    is,
    unmatched,
    not
  }) {
    const { currentRouteName } = React.useContext(reactContext);

    const wantsUnmatched = (unmatched === true) && (currentRouteName === 'root');
    const wantsAny = (is === undefined) && (unmatched === undefined) && (not === undefined);
    const isMatch = contains(is, currentRouteName);
    const isMatchNot = (not !== undefined) && !contains(not, currentRouteName);

    if (wantsUnmatched) {
      return children;
    }

    if (isMatchNot) {
      return children;
    }

    if (isMatch) {
      return children;
    }

    if (wantsAny) {
      return children;
    }

    return null;
  };
}

// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------

module.exports = injectRoute;
