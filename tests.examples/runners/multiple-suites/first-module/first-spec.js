// ./first-module/first-spec.js
const test = require('supposed').suites['supposed-tests.first-module']
const { expect } = test.dependencies

module.exports = test('given first-module, when... it...', (t) => {
  expect(42 / 0).to.equal(Infinity)
})
