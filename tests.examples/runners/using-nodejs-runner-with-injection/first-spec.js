// ./first-module/first-spec.js
module.exports = (test, dependencies) => test('given first-module, when... it...', (t) => {
  t.strictEqual(dependencies.one, 'one')
})
