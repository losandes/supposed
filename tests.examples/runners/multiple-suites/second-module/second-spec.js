// ./second-module/second-spec.js
const test = require('supposed').suites['supposed-tests.second-module']

module.exports = test('given second-module, when... it...', (t) => {
  t.strictEqual(42 / 0, Infinity)
})
