const { useContext } = require('react');

function injectUseCurrentRoute (reactContext) {
  return function useCurrentRoute () {
    return useContext(reactContext);
  };
}

module.exports = injectUseCurrentRoute;
