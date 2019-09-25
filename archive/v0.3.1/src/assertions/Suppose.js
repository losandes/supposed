module.exports = {
  name: 'Suppose',
  factory: Suppose
}

function Suppose (assert) {
  const suppose = (actual) => {
    /**
     * Strict equality check (===)
     * i.e.
     *   suppose(1).equals('1')               // AssertionError
     *   suppose({ a: 1 }).equals({ a: '1' }) // AssertionError
     *   suppose(42 / 0).equals(Infinity)     // OK
     *   suppose({ answers: [1,2,3] }).equals({ answers: [1,2,3] }) // OK
     */
    const equals = (expected, message) => {
      assert.deepStrictEqual(actual, expected, message)
    }

    /**
     * Strict not equals check (!==)
     */
    const notEquals = (expected, message) => {
      assert.notDeepStrictEqual(actual, expected, message)
    }

    /**
     * Abstract equality check (==)
     * i.e.
     *   suppose(1).looselyEquals('1')               // OK
     *   suppose({ a: 1 }).looselyEquals({ a: '1' }) // OK
     *   suppose(42 / 0).looselyEquals(Infinity)     // OK
     *   suppose({ answers: [1,2,3] }).looselyEquals({ answers: [1,2,3] }) // OK
     */
    const looselyEquals = (expected, message) => {
      assert.deepEqual(actual, expected, message)
    }

    /**
     * Abstract not equals check (!=)
     */
    const notLooselyEquals = (expected, message) => {
      assert.notDeepEqual(actual, expected, message)
    }

    /**
     * Validates that a block throws an error
     * i.e.
     *   suppose(() => { throw new Error('Boom!') }).throws()
     */
    const throws = (error, message) => {
      assert.throws(actual, error, message)
    }

    /**
     * Validates that a block does NOT throw an error
     * i.e.
     *   suppose(() => { return 42 }).doesNotThrow()
     */
    const doesNotThrow = (message) => {
      assert.doesNotThrow(actual, null, message)
    }

    /**
     * Asserts the given object is truthy
     * i.e.
     *   suppose('something').isTruthy()    // OK
     *   suppose(true).isTruthy()           // OK
     *   suppose(0).isTruthy()              // AssertionError
     *   suppose(false).isTruthy()          // AssertionError
     */
    const isTruthy = (message) => {
      if (!actual) {
        assert.fail(message || actual)
      }
    }

    /**
     * Asserts the given object is falsy
     * i.e.
     *   suppose('something').isFalsy()    // AssertionError
     *   suppose(true).isFalsy()           // AssertionError
     *   suppose(err).isFalsy()            // AssertionError
     *   suppose(0).isFalsy()              // OK
     *   suppose(false).isFalsy()          // OK
     */
    const isFalsy = (message) => {
      if (actual) {
        assert.fail(message || actual)
      }
    }

    return {
      equals,
      notEquals,
      looselyEquals,
      notLooselyEquals,
      throws,
      doesNotThrow,
      isTruthy,
      isFalsy,
      exists: isTruthy,
      notExists: isFalsy
    }
  }

  suppose.noError = assert.ifError

  // map assert to suppose for backwards compatibility
  suppose.deepEqual = assert.deepEqual
  suppose.deepStrictEqual = assert.deepStrictEqual
  suppose.doesNotThrow = assert.doesNotThrow
  suppose.equal = assert.equal
  suppose.fail = assert.fail
  suppose.ifError = assert.ifError
  suppose.notDeepEqual = assert.notDeepEqual
  suppose.notDeepStrictEqual = assert.notDeepStrictEqual
  suppose.notEqual = assert.notEqual
  suppose.notStrictEqual = assert.notStrictEqual
  suppose.ok = assert.ok
  suppose.strictEqual = assert.strictEqual
  suppose.throws = assert.throws

  return suppose
}
