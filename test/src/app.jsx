import React from 'react';

import {
  RouteProvider,
  Link,
  Route,
  useCurrentRoute,
  getRoutePath
} from './routes';

function AppRoot () {
  return (
    <RouteProvider>
      <App/>
    </RouteProvider>
  )
}

function Turntable () {
  const {
    currentRouteContext: { recordName }
  } = useCurrentRoute();

  return (
    <p>Current Record: {recordName}</p>
  );
}

function App () {
  const {
    currentRouteName,
    currentRouteContext,
    currentRoutePath,
    currentRouteMeta
  } = useCurrentRoute();

  const testLinkEls = [
    { name: 'mammal' },
    { name: 'mammal.primate' },
    { name: 'mammal.primate.hominidae' },
    { name: 'mammal.primate.pongidae' },
    { name: 'mammal.felis' },
    { name: 'mammal.felis.domestica' },
    { name: 'mammal.felis.leo' },
    { name: 'crates.crate', context: { recordName: 'uptown' } },
    { name: 'crates.crate.play', context: { recordName: 'rockers' } },
    { name: 'glob', context: { addr: '/drop/the/bass?size=xxx' } },
    { name: 'glob-with-fragment', context: { addr: '/ipcf/x/a/x/b&/x/c', fragment: '/x/c' } }
  ].map((obj) => {
    return (
      <p key={obj.name}>
        <Link to={obj.name} context={obj.context}>
          <strong>{obj.name}</strong>
          &nbsp;
          &mdash;
          &nbsp;
          <code>{getRoutePath(obj.name, obj.context)}</code>
        </Link>
      </p>
    )
  });

  return (
    <>
      <h1>react-routes-dub</h1>
      <h2>Current Route</h2>
      <p>Name: <code>{ currentRouteName }</code></p>
      <p>Context: <code>{ JSON.stringify(currentRouteContext) }</code></p>
      <p>Path: <code>{ currentRoutePath }</code></p>
      <p>Meta: <code>{ JSON.stringify(currentRouteMeta) }</code></p>

      <hr/>

      { testLinkEls }

      <Route is={['crates.crate', 'crates.crate.play']}>
        <Turntable/>
      </Route>
    </>
  );
}

export default AppRoot;
