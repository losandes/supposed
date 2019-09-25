// ./second-module/second-spec.js
module.exports = (test, dependencies) => test('given second-module, when... it...', (t) => {
  t.strictEqual(dependencies.two, 'two')
})
