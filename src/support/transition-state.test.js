const test = require('tape');
const TransitionState = require('./transition-state');

test('TransitionState', (t) => {
  t.test('basic usage', async (assert) => {
    const state = new TransitionState();

    state.setDestination('beta', { p1: 'one', p2: 'two' });
    state.setCursor('alpha');

    assert.equal(state.isEqual(), false);
    assert.equal(state.getDestinationName(), 'beta');
    assert.equal(state.getCursorName(), 'alpha');

    state.setCursor('beta');
    assert.equal(state.isEqual(), false);
    assert.equal(state.getDestinationName(), 'beta');
    assert.equal(state.getCursorName(), 'beta');

    state.setCursor('beta', { p1: 'one', p2: 'five' });
    assert.equal(state.isEqual(), false);
    assert.equal(state.getDestinationName(), 'beta');
    assert.equal(state.getCursorName(), 'beta');

    state.setCursor('beta', { p1: 'one', p2: 'two' });
    assert.equal(state.isEqual(), true);
    assert.equal(state.getDestinationName(), 'beta');
    assert.equal(state.getCursorName(), 'beta');

    assert.end();
  });

  t.test('undefined context', async (assert) => {
    const state = new TransitionState();

    state.setDestination('gamma');
    state.setCursor('delta');
    assert.equal(state.isEqual(), false);

    state.setDestination('gamma', {});
    state.setCursor('delta');
    assert.equal(state.isEqual(), false);

    state.setDestination('gamma', {});
    state.setCursor('delta');
    assert.equal(state.isEqual(), false);

    assert.end();
  });

  t.test('empty', async (assert) => {
    const state = new TransitionState();
    assert.equal(state.isEqual(), true);
    assert.end();
  });
});
