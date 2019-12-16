const test = require('tape');
const MemoryStore = require('./memory-store');

test('MemoryStore', (t) => {
  t.test('basic', (assert) => {
    const store = new MemoryStore();

    store.onRoutePathChange(() => {
      assert.equal(
        store.getRoutePath(),
        '/home/phone/et'
      );
      assert.end();
    });

    store.setRoutePath('/home/phone/et');
  });
});
