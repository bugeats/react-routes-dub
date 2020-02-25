const React = require('react');

function injectLink (dubRuntime) {
  function Link ({
    children,
    context,
    onClick,
    to
  }) {
    const path = dubRuntime.getRoutePath(to, context);

    function handleRouteLinkClick (evt) {
      evt.preventDefault();
      dubRuntime.transitionPathTo(path);
    }

    return React.createElement('a', {
      href: path,
      onClick: onClick || handleRouteLinkClick
    }, children);
  }

  return Link;
}

// -----------------------------------------------------------------------------

module.exports = injectLink;
