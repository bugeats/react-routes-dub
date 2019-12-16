/* eslint-disable no-console */

const DubRuntime = require('./dub-runtime');
const test = require('tape');
const MemoryStore = require('./stores/memory-store');

// -----------------------------------------------------------------------------

function gimmeDub (routesDef) {
  return new DubRuntime(routesDef, {
    store: new MemoryStore(),
    log: console.log
  });
}

// -----------------------------------------------------------------------------

test('DubRuntime (public)', (t) => {
  t.test('path and context getters ok', async (assert) => {
    const runtime = gimmeDub([
      {
        name: 'limbo'
      },
      {
        name: 'pets',
        onVisit: () => new Promise((resolve) => setTimeout(resolve, 5)),
        routes: [
          {
            name: 'pet',
            pattern: '/:petName/age/:petAge/ok'
          }
        ]
      }
    ]);

    await runtime.transitionRouteTo('limbo');
    await runtime.transitionRouteTo('pets.pet', { petName: 'buster', petAge: '13' });

    assert.equal(runtime.getCurrentRouteName(), 'pets.pet');
    assert.deepEqual(runtime.getCurrentRouteContext(), { petName: 'buster', petAge: '13' });

    assert.equal(
      runtime.getRoutePath(
        runtime.getCurrentRouteName(),
        runtime.getCurrentRouteContext()
      ),
      '/pets/buster/age/13/ok'
    );

    assert.end();
  });

  t.test('transitionRouteTo', async (assert) => {
    const runtime = gimmeDub([
      {
        name: 'alpha',
        onVisit: () => new Promise((resolve) => setTimeout(resolve, 6)),
        routes: [
          {
            name: 'beta',
            onVisit: () => new Promise((resolve) => setTimeout(resolve, 3)),
            onVisitDescending: () => new Promise((resolve) => setTimeout(resolve, 5)),
            routes: [
              {
                name: 'gamma',
                pattern: '/gamma/:p1/:p2',
                onVisit: () => new Promise((resolve) => setTimeout(resolve, 3)),
                onEnter: () => new Promise((resolve) => setTimeout(resolve, 7))
              }
            ]
          },
          {
            name: 'numberwang',
            onVisit: () => new Promise((resolve) => setTimeout(resolve, 8))
          }
        ]
      }
    ]);

    await runtime.transitionRouteTo('alpha.numberwang');

    // spam a bunch of concurrent transitions
    await Promise.all([
      runtime.transitionRouteTo('alpha'),
      runtime.transitionRouteTo('alpha.beta'),
      runtime.transitionRouteTo('alpha.beta.gamma', { p1: 'one', p2: 'two' }),
      runtime.transitionRouteTo('alpha.numberwang'),
      runtime.transitionRouteTo('alpha'),
      runtime.transitionRouteTo('alpha.beta'),
      runtime.transitionRouteTo('alpha.beta.gamma', { p1: 'one', p2: 'two' }),
      runtime.transitionRouteTo('alpha.numberwang')
    ]);

    await runtime.transitionRouteTo('alpha.beta.gamma', { p1: 'one', p2: 'two' });

    assert.equal(runtime.getCurrentRouteName(), 'alpha.beta.gamma');
    assert.deepEqual(runtime.getCurrentRouteContext(), { p1: 'one', p2: 'two' });

    assert.end();
  });

  t.test('homestar', async (assert) => {
    const runtime = gimmeDub([
      {
        name: 'home',
        pattern: '/'
      },
      {
        name: '404',
        pattern: '(.*)'
      }
    ]);

    await runtime.store.setRoutePath('/');
    assert.equal(runtime.getCurrentRouteName(), 'home');

    await runtime.store.setRoutePath('/silver/bullet');
    assert.equal(runtime.getCurrentRouteName(), '404');

    assert.end();
  });

  t.test('other public methods', async (assert) => {
    const runtime = gimmeDub([
      {
        name: 'alpha',
        routes: [
          {
            name: 'numberwang',
            pattern: '/nwang/:number',
            meta: {
              bestNumber: 1
            }
          }
        ]
      }
    ]);

    assert.equal(
      runtime.getRoutePath('alpha.numberwang', { number: 'fiddy' }),
      '/alpha/nwang/fiddy'
    );

    assert.deepEqual(
      runtime.getRouteMeta('alpha.numberwang'),
      { bestNumber: 1 }
    );

    await runtime.store.setRoutePath('/alpha/nwang/9000');

    assert.equal(
      runtime.getCurrentRouteName(),
      'alpha.numberwang'
    );

    assert.deepEqual(
      runtime.getCurrentRouteContext(),
      { number: '9000' }
    );

    assert.end();
  });
});

test('DubRuntime (private)', (t) => {
  t.test('basic urls', async (assert) => {
    const runtime = gimmeDub([
      {
        name: 'crates',
        pattern: '/crates',
        routes: [
          {
            name: 'crate',
            pattern: '/:recordName'
          }
        ]
      }
    ]);

    await runtime.store.setRoutePath('/crates/tubby');
    assert.equal(runtime.getCurrentRouteName(), 'crates.crate');
    assert.deepEqual(runtime.getCurrentRouteContext(), {
      recordName: 'tubby'
    });

    assert.end();
  });

  t.test('glob urls', async (assert) => {
    const runtime = gimmeDub([
      {
        name: 'glob',
        pattern: '/glob:addr(.*)'
      }
    ]);

    await runtime.store.setRoutePath('/glob/ipcf/QmA/three.cue');
    assert.equal(runtime.getCurrentRouteName(), 'glob');
    assert.deepEqual(runtime.getCurrentRouteContext(), {
      addr: '/ipcf/QmA/three.cue'
    });

    assert.end();
  });

  test('globs with fragments', async (assert) => {
    const runtime = gimmeDub([
      {
        name: 'explore',
        pattern: '/explore:addr([^#]*)',
        routes: [
          {
            name: 'fragment',
            pattern: '#:fragment(.*)'
          }
        ]
      }
    ]);

    assert.deepEqual(
      runtime.tree.matchRoutePath('/explore'),
      { routeName: 'explore', routeContext: { addr: '' } }
    );

    assert.deepEqual(
      runtime.tree.matchRoutePath('/explore/ipcf/x/y/z'),
      { routeName: 'explore', routeContext: { addr: '/ipcf/x/y/z' } }
    );

    assert.deepEqual(
      runtime.tree.matchRoutePath('/explore/ipcf/x/y/z#/y/z'),
      { routeName: 'explore.fragment', routeContext: { addr: '/ipcf/x/y/z', fragment: '/y/z' } }
    );

    assert.end();
  });

  t.test('root links', async (assert) => {
    const runtime = gimmeDub([
      {
        name: 'dinky'
      },
      {
        name: 'home',
        pattern: '/'
      }
    ]);

    assert.deepEqual(
      runtime.tree.matchRoutePath('/'),
      { routeName: 'home', routeContext: {} }
    );

    assert.deepEqual(
      runtime.getRoutePath('dinky'),
      '/dinky'
    );

    assert.deepEqual(
      runtime.getRoutePath('home'),
      '/'
    );

    assert.deepEqual(
      runtime.getRoutePath('home', {}),
      '/'
    );

    await runtime.transitionRouteTo('dinky');
    await runtime.transitionRouteTo('home');

    assert.deepEqual(
      runtime.getCurrentRouteName(),
      'home'
    );

    assert.deepEqual(
      runtime.getCurrentRouteContext(),
      {}
    );

    assert.deepEqual(
      runtime.store.getRoutePath(),
      '/'
    );

    assert.end();
  });
});
