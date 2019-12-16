function argSmoosher (args = []) {
  // Parse out arguments into a single merged object and array pair.
  // All args are merged. Order does not matter.
  const { obj, list } = args.reduce((accu, arg) => {
    if (Array.isArray(arg)) {
      return {
        ...accu,
        list: [...accu.list, ...arg]
      };
    }
    if (arg && arg.constructor && arg.constructor.name === 'Object') {
      return {
        ...accu,
        obj: { ...accu.obj, ...arg }
      };
    }
    return accu;
  }, { obj: {}, list: [] });

  return { obj, list };
}

module.exports = argSmoosher;
