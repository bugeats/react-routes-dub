/* eslint-disable no-console */

const routesDub = require('./routes-dub');
const test = require('tape');
const MemoryStore = require('./stores/memory-store');

test('routesDub', (t) => {
  t.test('basic', async (assert) => {
    const api = routesDub({
      store: new MemoryStore()
    }, [
      {
        name: 'alpha',
        pattern: '/alpha'
      },
      {
        name: 'beta',
        pattern: '/beta/:betaId',
        meta: {
          colored: false,
          rooty: true
        },
        routes: [
          {
            name: 'gamma',
            pattern: '/gamma/:gammaId',
            routes: [
              {
                name: 'epsilon'
              }
            ]
          },
          {
            name: 'delta',
            pattern: '/delta',
            meta: {
              colored: true,
              favorite: 'fishsticks'
            }
          }
        ]
      }
    ]);

    await api.transitionRouteTo('alpha');
    assert.equal(api.getCurrentRouteName(), 'alpha');

    await api.transitionRouteTo('beta.delta', { betaId: '456' });
    assert.equal(api.getCurrentRouteName(), 'beta.delta');
    assert.equal(
      api.getRoutePath('beta.delta', { betaId: '123' }),
      '/beta/123/delta'
    );
    assert.deepEqual(
      api.getRouteMeta('beta.delta'),
      { colored: true, rooty: true, favorite: 'fishsticks' }
    );

    assert.end();
  });

  t.test('change events', async (assert) => {
    const api = routesDub({
      store: new MemoryStore()
    }, [
      { name: 'alpha' },
      { name: 'beta' }
    ]);

    await api.transitionRouteTo('alpha');

    api.onRouteChange((toRouteName, fromRouteName) => {
      assert.equal(toRouteName, 'beta');
      assert.equal(fromRouteName, 'alpha');
      assert.end();
    });

    await api.transitionRouteTo('beta');
  });

  t.test('context getter', async (assert) => {
    const api = routesDub({
      store: new MemoryStore()
    }, [
      {
        name: 'pets',
        pattern: '/pets/:petName',
        routes: [
          {
            name: 'snacks',
            pattern: '/snacks/:snackName'
          }
        ]
      }
    ]);

    await api.transitionRouteTo('pets.snacks', {
      petName: 'simon', snackName: 'ham'
    });

    assert.deepEqual(
      api.getCurrentRouteContext(),
      { petName: 'simon', snackName: 'ham' }
    );

    assert.end();
  });

  t.test('bound components smoke test', async (assert) => {
    const api = routesDub({
      store: new MemoryStore()
    }, [
      { name: 'scientist' }
    ]);
    assert.equal(typeof api.RouteProvider, 'function');
    assert.equal(typeof api.Link, 'function');
    assert.equal(typeof api.Route, 'function');
    assert.end();
  });
});
