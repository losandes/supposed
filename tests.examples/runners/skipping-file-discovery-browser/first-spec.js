// ./first-module/first-spec.js
module.exports = (test) => test('given first-module', {
  'when...': {
    given: () => 42,
    when: (given) => given / 0,
    'it...': () => (err, actual) => {
      if (err) {
        throw err
      }

      if (actual !== Infinity) {
        throw new Error(`Expected ${actual} === Infinity`)
      }
    }
  },
  'foo should be available from setup.js': () => {
    if (test.dependencies.foo !== 'bar') { // eslint-disable-line no-undef
      throw new Error(`Expected foo ${typeof test.dependencies.foo} to be {string}`)
    }
  }
})
