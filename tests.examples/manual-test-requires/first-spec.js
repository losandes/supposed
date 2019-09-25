// ./first-module/first-spec.js
const test = require('supposed')

module.exports = test('given first-module, when... it...', (t) => {
  t.strictEqual(42 / 0, Infinity)
})
