const test = require('supposed')

module.exports = test('when dividing a number by zero', {
  given: () => 42,
  when: (number) => {
    return {
      given: number,
      actual: number / 0
    }
  },
  'it should return Infinity': (then) => (err, { given, actual }) => {
    then.ifError(err)
    then.strictEqual(actual, Infinity)
    return {
      log: {
        given,
        actual
      }
    }
  }
})
