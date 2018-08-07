module.exports = class BoundHistory {
  constructor () {
    this.handlers = [];
    window.addEventListener('popstate', () => {
      this.didChange();
    });
  }

  getCurrentPath () {
    return window.location.href.substr(window.location.origin.length);
  }

  pushPath (path) {
    const prev = this.getCurrentPath();
    window.history.pushState({}, '', path);
    if (this.getCurrentPath() !== prev) {
      this.didChange();
    }
  }

  onPathChange (fn) {
    this.handlers.push(fn);
  }

  didChange () {
    this.handlers.forEach(fn => fn(this.getCurrentPath()));
  }
};
