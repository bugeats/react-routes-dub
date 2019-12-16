class TransitionState {
  constructor () {
    this.destinationName = undefined;
    this.destinationContext = {};
    this.cursorName = undefined;
    this.cursorContext = {};
  }

  setDestination (destinationName, destinationContext = {}) {
    this.destinationName = destinationName;
    this.destinationContext = destinationContext;
  }

  setCursor (cursorName, cursorContext = {}) {
    this.cursorName = cursorName;
    this.cursorContext = cursorContext;
  }

  getDestinationName () {
    return this.destinationName;
  }

  getDestinationContext () {
    return this.destinationContext;
  }

  getCursorName () {
    return this.cursorName;
  }

  getCursorContext () {
    return this.cursorContext;
  }

  isEqual () {
    return (
      this.cursorName === this.destinationName
      // deep equality compare for contexts
      && JSON.stringify(this.cursorContext) === JSON.stringify(this.destinationContext)
    );
  }

  forceEqual () {
    this.cursorName = this.destinationName;
    this.cursorContext = this.destinationContext;
  }
}

module.exports = TransitionState;
