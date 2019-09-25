// ./first-module/first-spec.js
module.exports = (test) => test('given first-module, when...', {
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
})
