/* eslint-disable no-console */

const test = require('tape');
const MemoCache = require('./memo-cache');

test('MemoCache', (t) => {
  t.test('memoize primitive args', async (assert) => {
    const memoCache = new MemoCache();
    const addNumbersMemo = memoCache.memoize((a, b) => {
      return a + b;
    });

    assert.equal(addNumbersMemo(5, 9), 14);
    assert.equal(addNumbersMemo(5, 9), 14);
    assert.equal(memoCache.size, 1);
    assert.equal(addNumbersMemo(9000, 1), 9001);
    assert.equal(addNumbersMemo(9000, 1), 9001);
    assert.equal(memoCache.size, 2);

    assert.end();
  });

  t.test('memoize async', async (assert) => {
    const memoCache = new MemoCache();

    const addNumbersMemo = memoCache.memoize(async (a, b) => {
      await new Promise(resolve => setTimeout(resolve, 0));
      return a + b;
    });

    assert.equal(await addNumbersMemo(5, 9), 14);
    assert.equal(await addNumbersMemo(5, 9), 14);
    assert.equal(memoCache.size, 1);
    assert.equal(await addNumbersMemo(9000, 1), 9001);
    assert.equal(await addNumbersMemo(9000, 1), 9001);
    assert.equal(memoCache.size, 2);

    assert.end();
  });
});
