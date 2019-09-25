// ./first-module/first-spec.js
module.exports = (test) => test('given first-module, when... it...', (t) => {
  t.strictEqual(42 / 0, Infinity)
})
