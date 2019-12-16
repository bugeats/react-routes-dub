const React = require('react');

module.exports = function injectRouteProvider (dubRuntime, reactContext) {
  return function RouteProvider ({
    children
  }) {
    function getState () {
      const currentRouteName = dubRuntime.getCurrentRouteName();
      const currentRouteContext = dubRuntime.getCurrentRouteContext();

      // here is the state available to useCurrentRoute hook
      return {
        currentRouteName,
        currentRouteContext,
        currentRoutePath: dubRuntime.getRoutePath(currentRouteName, currentRouteContext),
        currentRouteMeta: dubRuntime.getRouteMeta(currentRouteName, currentRouteContext)
      };
    }

    const [value, setValue] = React.useState(getState());

    React.useEffect(() => {
      return dubRuntime.onRouteChange(() => {
        const state = getState();
        // TODO there's got to be a better way to detect change / equality
        const didChange = JSON.stringify(value) !== JSON.stringify(state);
        if (didChange) {
          setValue(getState());
        }
      });
    });

    return React.createElement(
      reactContext.Provider,
      { value },
      children
    );
  };
};
