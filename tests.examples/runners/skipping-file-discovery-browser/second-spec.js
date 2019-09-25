// ./second-module/second-spec.js
module.exports = (test) => test('given second-module, when...', {
  given: () => 4200,
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
