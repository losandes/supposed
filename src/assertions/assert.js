module.exports = {
  name: 'assert',
  factory: AssertFactory
}

function AssertFactory (AssertionError) {
  // function E(sym, val, def, ...otherClasses) {
  //   // Special case for SystemError that formats the error message differently
  //   // The SystemErrors only have SystemError as their base classes.
  //   messages.set(sym, val);
  //   if (def === SystemError) {
  //     def = makeSystemErrorWithCode(sym);
  //   } else {
  //     def = makeNodeErrorWithCode(def, sym);
  //   }
  //
  //   if (otherClasses.length !== 0) {
  //     otherClasses.forEach((clazz) => {
  //       def[clazz.name] = makeNodeErrorWithCode(clazz, sym);
  //     });
  //   }
  //   codes[sym] = def;
  // }
  // E('ERR_AMBIGUOUS_ARGUMENT', 'The "%s" argument is ambiguous. %s', TypeError)
  // E('ERR_INVALID_ARG_TYPE',
  //   (name, expected, actual) => {
  //     assert(typeof name === 'string', "'name' must be a string");
  //
  //     // determiner: 'must be' or 'must not be'
  //     let determiner;
  //     if (typeof expected === 'string' && expected.startsWith('not ')) {
  //       determiner = 'must not be';
  //       expected = expected.replace(/^not /, '');
  //     } else {
  //       determiner = 'must be';
  //     }
  //
  //     let msg;
  //     if (name.endsWith(' argument')) {
  //       // For cases like 'first argument'
  //       msg = `The ${name} ${determiner} ${oneOf(expected, 'type')}`;
  //     } else {
  //       const type = name.includes('.') ? 'property' : 'argument';
  //       msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, 'type')}`;
  //     }
  //
  //     // TODO(BridgeAR): Improve the output by showing `null` and similar.
  //     msg += `. Received type ${typeof actual}`;
  //     return msg;
  //   }, TypeError);
  // E('ERR_INVALID_ARG_VALUE', (name, value, reason = 'is invalid') => {
  //   let inspected = lazyInternalUtilInspect().inspect(value);
  //   if (inspected.length > 128) {
  //     inspected = `${inspected.slice(0, 128)}...`;
  //   }
  //   return `The argument '${name}' ${reason}. Received ${inspected}`;
  // }, TypeError, RangeError);
  // E('ERR_INVALID_RETURN_VALUE', (input, name, value) => {
  //   let type;
  //   if (value && value.constructor && value.constructor.name) {
  //     type = `instance of ${value.constructor.name}`;
  //   } else {
  //     type = `type ${typeof value}`;
  //   }
  //   return `Expected ${input} to be returned from the "${name}"` +
  //          ` function but got ${type}.`;
  // }, TypeError);

  const deepEqual = function (actual, expected, message) {
    if (arguments.length < 2) {
      throw new TypeError('actual, and expected arguments must be specified')
    }
    if (isDeepEqual === undefined) lazyLoadComparison()
    if (!isDeepEqual(actual, expected)) {
      innerFail({
        actual,
        expected,
        message,
        operator: 'deepEqual',
        stackStartFn: deepEqual
      })
    }
  }

  return {
    deepEqual,
    deepStrictEqual,
    doesNotThrow,
    equal,
    fail,
    ifError,
    notDeepEqual,
    notDeepStrictEqual,
    notEqual,
    notStrictEqual,
    ok,
    strictEqual,
    throws
  }
}
