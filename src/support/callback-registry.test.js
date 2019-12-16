const test = require('tape');
const CallbackRegistry = require('./callback-registry');

test('CallbackRegistry', (t) => {
  t.test('no duplicates', async (assert) => {
    assert.plan(2);

    const reg = new CallbackRegistry();

    function handler (x) {
      assert.equal(x, 'perry');
    }

    reg.register(handler);
    reg.register(handler);
    reg.register(handler);
    reg.register(handler);
    reg.register(handler);

    assert.equal(reg.size(), 1);

    await reg.broadcast('perry');
  });

  t.test('basic usage', async (assert) => {
    assert.plan(9);

    const reg = new CallbackRegistry();

    assert.equal(reg.size(), 0);

    const unregister1 = reg.register((x) => {
      assert.equal(x, 'king');
    });

    const unregister2 = reg.register((x) => {
      assert.equal(x, 'king');
    });

    assert.equal(reg.size(), 2);

    await reg.broadcast('king');

    unregister1();

    assert.equal(reg.size(), 1);

    await reg.broadcast('king');

    unregister2();

    assert.equal(reg.size(), 0);

    const unregister3 = reg.register((x) => {
      assert.equal(x, 'tubby');
    });

    assert.equal(reg.size(), 1);

    await reg.broadcast('tubby');
  });
});
