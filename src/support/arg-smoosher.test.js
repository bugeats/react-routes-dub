const test = require('tape');
const argSmoosher = require('./arg-smoosher');

test('argSmoosher', (t) => {
  t.test('empty args', (assert) => {
    const result = argSmoosher();
    assert.deepEqual(result, { obj: {}, list: [] });
    assert.end();
  });

  t.test('merge', (assert) => {
    const result = argSmoosher([
      { alpha: 'A', beta: 'C' },
      ['dogs'],
      { gamma: 'G' },
      ['dogs', 'cats']
    ]);
    assert.deepEqual(result,
      { obj: { alpha: 'A', beta: 'C', gamma: 'G' }, list: [ 'dogs', 'dogs', 'cats' ] }
    );
    assert.end();
  });
});
