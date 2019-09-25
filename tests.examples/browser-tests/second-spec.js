// ./second-module/second-spec.js
module.exports = (test) => test('given second-module, when... it...', (t) => {
  t.strictEqual(42 / 0, Infinity)
})
