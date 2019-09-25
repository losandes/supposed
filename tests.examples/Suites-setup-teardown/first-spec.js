// ./first-module/first-spec.js
module.exports = (test) => {
  const { some } = test.dependencies

  return test('given first-module, when... it...', (t) => {
    t.strictEqual(some, 'dependencies')
  })
}
