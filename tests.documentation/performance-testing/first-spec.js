// ./first-module/first-spec.js
// module.exports = (test) => test('given first-module, when... it...', (t) => {
//   t.strictEqual(42 / 0, Infinity)
// })

module.exports = (test) => test('given first-module, when... it...', {
  'and it': (t) => {
    t.strictEqual(42 / 0, Infinity)
  },
  'and something': {
    'and something else': (t) => {
      t.strictEqual(42 / 0, Infinity)
    }
  }
})
