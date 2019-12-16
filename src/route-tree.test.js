/* eslint-disable no-console */

const test = require('tape');
const RouteTree = require('./route-tree');

const routeTree = new RouteTree([
  {
    name: 'home',
    pattern: '/',
    meta: { temperature: 65 },
    routes: [
      {
        name: 'kitchen',
        pattern: '/kitchen',
        routes: [
          {
            name: 'sink'
          }
        ]
      },
      {
        name: 'bathroom',
        pattern: '/bathroom',
        meta: { temperature: 74 },
        routes: [
          {
            name: 'sink'
          },
          {
            name: 'toilet'
          }
        ]
      }
    ]
  },
  {
    name: 'garden',
    pattern: '/le-garden',
    routes: [
      {
        name: 'lot',
        pattern: '/:lotName',
        routes: [
          {
            name: 'bed',
            pattern: '/east/:eastPlants/west/:westPlants'
          }
        ]
      }
    ]
  },
  {
    name: 'garage',
    routes: [
      {
        name: 'workbench',
        routes: [
          {
            name: 'cupboards',
            routes: [
              { name: 'screwdriver' },
              { name: 'screws' },
              { name: 'hammer' }
            ]
          },
          {
            name: 'shelves',
            routes: [
              { name: 'drillpress' },
              { name: 'router' }
            ]
          }
        ]
      },
      {
        name: 'storage',
        routes: [
          {
            name: 'buckets',
            routes: [
              { name: 'shoes' },
              { name: 'xmas' }
            ]
          },
          {
            name: 'totes'
          }
        ]
      }
    ]
  }
]);

// -----------------------------------------------------------------------------

function testTrail (t, from, to, expected) {
  const result = [];
  let next = from;
  while (next) {
    const item = routeTree.trailNext(next, to);
    if (item) {
      next = item.routeName;
      result.push(item);
    } else {
      next = undefined;
    }
  }
  t.deepEqual(result, expected);
}

// -----------------------------------------------------------------------------

test('RouteTree init', (t) => {
  t.test('bad route name throws errors', async (assert) => {
    try {
      new RouteTree([
        {
          name: '.i am lost'
        }
      ]);
    } catch (err) {
      assert.ok(err);
      assert.end();
    }
  });
});

test('RouteTree', (t) => {
  t.test('get', async (assert) => {
    const home = routeTree.get('home');
    assert.deepEqual(home, {
      ...home,
      name: 'home',
      pattern: '/',
      meta: { temperature: 65 },
      parent: undefined,
      ancestors: [],
      children: ['home.kitchen', 'home.bathroom'],
      descendants: ['home.kitchen', 'home.kitchen.sink', 'home.bathroom', 'home.bathroom.sink', 'home.bathroom.toilet']
    });

    const kitchen = routeTree.get('home.kitchen');
    assert.deepEqual(kitchen, {
      ...kitchen,
      name: 'home.kitchen',
      pattern: '/kitchen',
      meta: { temperature: 65 },
      parent: 'home',
      ancestors: ['home'],
      children: ['home.kitchen.sink'],
      descendants: ['home.kitchen.sink']
    });

    const sink = routeTree.get('home.bathroom.sink');
    assert.deepEqual(sink, {
      ...sink,
      name: 'home.bathroom.sink',
      pattern: '/bathroom/sink',
      meta: { temperature: 74 },
      parent: 'home.bathroom',
      ancestors: ['home.bathroom', 'home'],
      children: [],
      descendants: []
    });
    assert.end();
  });

  t.test('has', async (assert) => {
    assert.equal(
      routeTree.has('home.kitchen'),
      true
    );

    assert.equal(
      routeTree.has('home.bathroom.sink'),
      true
    );

    assert.equal(
      routeTree.has('home.bathroom.knives'),
      false
    );

    assert.equal(
      routeTree.has(),
      false
    );

    assert.equal(
      routeTree.has({ wut: 'I am lost' }),
      false
    );

    assert.end();
  });

  t.test('matchRoutePath', async (assert) => {
    assert.deepEqual(
      routeTree.matchRoutePath('/kitchen/sink'),
      {
        routeName: 'home.kitchen.sink',
        routeContext: {}
      }
    );

    assert.deepEqual(
      routeTree.matchRoutePath('/fishsticks/mcfishface/9000'),
      undefined
    );

    assert.deepEqual(
      routeTree.matchRoutePath('/le-garden/herbs/east/dill/west/parsnips'),
      {
        routeName: 'garden.lot.bed',
        routeContext: {
          lotName: 'herbs',
          eastPlants: 'dill',
          westPlants: 'parsnips'
        }
      }
    );

    assert.end();
  });

  t.test('getRoutePath', async (assert) => {
    assert.deepEqual(
      routeTree.getRoutePath('home.kitchen.sink'),
      '/kitchen/sink'
    );

    assert.deepEqual(
      routeTree.getRoutePath('garden.lot', { lotName: 'flowers' }),
      '/le-garden/flowers'
    );

    assert.deepEqual(
      routeTree.getRoutePath('garden.lot.bed', { lotName: 'flowers', eastPlants: 'roses', westPlants: 'thorns' }),
      '/le-garden/flowers/east/roses/west/thorns'
    );

    assert.end();
  });

  t.test('trailNext full trail', async (assert) => {
    testTrail(assert, 'home', 'home', []);

    testTrail(assert, 'garden.lot', 'garden.lot', []);

    testTrail(assert, 'garden.lot', 'garden.lot.bed', [
      { routeName: 'garden.lot.bed', isDestination: true }
    ]);

    testTrail(assert, 'garage.workbench.shelves.router', 'garage.workbench.shelves.drillpress', [
      { routeName: 'garage.workbench.shelves', isApex: true },
      { routeName: 'garage.workbench.shelves.drillpress', isDestination: true }
    ]);

    testTrail(assert, 'garage.workbench.shelves.router', 'garage.storage.buckets.xmas', [
      { routeName: 'garage.workbench.shelves', isAscending: true },
      { routeName: 'garage.workbench', isAscending: true },
      { routeName: 'garage', isApex: true },
      { routeName: 'garage.storage', isDescending: true },
      { routeName: 'garage.storage.buckets', isDescending: true },
      { routeName: 'garage.storage.buckets.xmas', isDestination: true }
    ]);

    testTrail(assert, 'garden.lot.bed', 'garage', [
      { routeName: 'garden.lot', isAscending: true },
      { routeName: 'garden', isAscending: true },
      // virtual root as apex is not emitted because it ain't real
      { routeName: 'garage', isDestination: true }
    ]);

    testTrail(assert, 'garden.lot.bed', 'garden', [
      { routeName: 'garden.lot', isAscending: true },
      { routeName: 'garden', isDestination: true }
    ]);

    testTrail(assert, 'home.bathroom.toilet', 'home.kitchen.sink', [
      { routeName: 'home.bathroom', isAscending: true },
      { routeName: 'home', isApex: true },
      { routeName: 'home.kitchen', isDescending: true },
      { routeName: 'home.kitchen.sink', isDestination: true }
    ]);

    testTrail(assert, 'home.kitchen.sink', 'garage.workbench.shelves.router', [
      { routeName: 'home.kitchen', isAscending: true },
      { routeName: 'home', isAscending: true },
      // virtual root as apex is not emitted because it ain't real
      { routeName: 'garage', isDescending: true },
      { routeName: 'garage.workbench', isDescending: true },
      { routeName: 'garage.workbench.shelves', isDescending: true },
      { routeName: 'garage.workbench.shelves.router', isDestination: true }
    ]);

    assert.end();
  });

  t.test('trailNext explicit results', async (assert) => {
    assert.deepEqual(
      routeTree.trailNext('garage', 'garage'),
      undefined
    );

    assert.deepEqual(
      routeTree.trailNext('home', 'garage'),
      { routeName: 'garage', isDestination: true }
    );

    assert.deepEqual(
      routeTree.trailNext('home', 'garage.workbench'),
      { routeName: 'garage', isDescending: true }
    );

    assert.deepEqual(
      routeTree.trailNext('home.kitchen.sink', 'garage.workbench.shelves.router'),
      { routeName: 'home.kitchen', isAscending: true }
    );

    assert.deepEqual(
      routeTree.trailNext('home.kitchen.sink', 'home.bathroom.toilet'),
      { routeName: 'home.kitchen', isAscending: true }
    );

    assert.deepEqual(
      routeTree.trailNext('garage.workbench.cupboards.hammer', 'garage.workbench.shelves'),
      { routeName: 'garage.workbench.cupboards', isAscending: true }
    );

    assert.deepEqual(
      routeTree.trailNext('garage.workbench', 'garage.workbench.cupboards.hammer'),
      { routeName: 'garage.workbench.cupboards', isDescending: true }
    );

    assert.deepEqual(
      routeTree.trailNext('garage.workbench', 'garage.workbench'),
      undefined
    );

    assert.deepEqual(
      routeTree.trailNext('garage.workbench.shelves', 'garage.workbench.cupboards'),
      { routeName: 'garage.workbench', isApex: true }
    );

    assert.deepEqual(
      routeTree.trailNext('garage.workbench', 'garage.workbench.cupboards'),
      { routeName: 'garage.workbench.cupboards', isDestination: true }
    );

    assert.deepEqual(
      routeTree.trailNext('home.bathroom', 'home.bathroom.toilet'),
      { routeName: 'home.bathroom.toilet', isDestination: true }
    );

    assert.deepEqual(
      routeTree.trailNext('garage.workbench', 'garage.workbench.shelves.router'),
      { routeName: 'garage.workbench.shelves', isDescending: true }
    );

    assert.deepEqual(
      routeTree.trailNext('garage.workbench.shelves.router', 'garage.workbench'),
      { routeName: 'garage.workbench.shelves', isAscending: true }
    );

    assert.deepEqual(
      routeTree.trailNext('home.kitchen.sink', 'home.bathroom.toilet'),
      { routeName: 'home.kitchen', isAscending: true }
    );

    assert.deepEqual(
      routeTree.trailNext('home.kitchen', 'home.bathroom.toilet'),
      { routeName: 'home', isApex: true }
    );

    assert.deepEqual(
      routeTree.trailNext('home', 'home.bathroom.toilet'),
      { routeName: 'home.bathroom', isDescending: true }
    );

    assert.deepEqual(
      routeTree.trailNext('home.bathroom', 'home.bathroom.toilet'),
      { routeName: 'home.bathroom.toilet', isDestination: true }
    );

    assert.deepEqual(
      routeTree.trailNext('home.bathroom.toilet', 'home.bathroom.toilet'),
      undefined
    );

    assert.deepEqual(
      routeTree.trailNext('home.bathroom.toilet', 'home.bathroom'),
      { routeName: 'home.bathroom', isDestination: true }
    );

    assert.deepEqual(
      routeTree.trailNext('home.bathroom', 'home.bathroom.toilet'),
      { routeName: 'home.bathroom.toilet', isDestination: true }
    );

    assert.end();
  });
});
