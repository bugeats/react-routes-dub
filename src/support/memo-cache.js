class MemoCache {
  constructor () {
    this.cache = new NestedCache();
    this.size = 0;
  }

  // only works with primitive values, but it should be nice and fast
  memoize (fn) {
    return (...args) => {
      const item = this.cache.get(args);
      if (item.hasOwnProperty('value')) {  // eslint-disable-line no-prototype-builtins
        return item.value;
      }
      this.size = this.size + 1;
      return item.value = fn.apply(this, args);
    };
  }

}

// -----------------------------------------------------------------------------

class NestedCache {
  constructor () {
    this.map     = new Map();
    this.weakMap = new WeakMap();
  }

  get (args) {
    return args.reduce(NestedCache.reducer, this);
  }

  store (value) {
    const t = typeof value;
    // objects can use WeakMap for perf
    const isObject = (t === 'object' || t === 'function') && value !== null;
    return Reflect.get(this, isObject ? 'weakMap' : 'map');
  }

  static reducer (cache, value) {
    const store = cache.store(value);
    return store.get(value) || store.set(value, new NestedCache()).get(value);
  }
}

// -----------------------------------------------------------------------------

module.exports = MemoCache;
