const React = require('react');

function injectLink (dubRuntime) {
  function Link ({
    children,
    context,
    to
  }) {
    const path = dubRuntime.getRoutePath(to, context);

    return React.createElement('a', {
      href: path,
      onClick: (evt) => {
        evt.preventDefault();
        dubRuntime.transitionPathTo(path);
      }
    }, children);
  }

  return Link;
}

// -----------------------------------------------------------------------------

module.exports = injectLink;
