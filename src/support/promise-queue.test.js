const test = require('tape');
const PromiseQueue = require('./promise-queue');

function wait (ms) {
  return new Promise((resolve) => setTimeout(() => resolve(true), ms));
}

test('PromiseQueue', (t) => {
  t.test('basic usage', async (assert) => {
    const queue = new PromiseQueue();

    const state = [];

    const dfd1 = queue.do(async () => {
      await wait(8);
      state.push('whispers');
      return 'librarian';
    });

    const dfd2 = queue.do(async () => {
      await wait(10);
      state.push('giggles');
      return 'libertarian';
    });

    // the latest await applies to all previous do operations
    await queue.do(async () => {
      await wait(6);
      state.push('screams');
    });

    assert.deepEqual(state, ['whispers', 'giggles', 'screams']);

    assert.deepEqual(await dfd1, 'librarian');
    assert.deepEqual(await dfd2, 'libertarian');

    assert.end();
  });
});
