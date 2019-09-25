const test = require('supposed').Suite({
  givenSynonyms: ['cause', 'before', 'setup'],
  whenSynonyms: ['effect', 'execute', 'run'],
  exit: (results) => results
})

module.exports = test('when dividing numbers by 0', {
  'cause, effect': {
    cause: () => 42,
    effect: (number) => { return number / 0 },
    'it should return Infinity': (assert) => (err, actual) => {
      assert.ifError(err)
      assert.strictEqual(actual, Infinity)
    }
  },
  'setup, run': {
    setup: () => 0,
    run: (number) => { return number / 0 },
    'it should return NaN': (assert) => (err, actual) => {
      assert.ifError(err)
      assert.strictEqual(isNaN(actual), true)
    }
  },
  'before, run': {
    before: () => 0,
    run: (number) => { return number / 0 },
    'it should return NaN': (assert) => (err, actual) => {
      assert.ifError(err)
      assert.strictEqual(isNaN(actual), true)
    }
  },
  'given, execute': {
    given: () => 0,
    execute: (number) => { return number / 0 },
    'it should return NaN': (assert) => (err, actual) => {
      assert.ifError(err)
      assert.strictEqual(isNaN(actual), true)
    }
  }
})
