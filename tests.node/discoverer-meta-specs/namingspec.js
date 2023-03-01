module.exports = (test) => {
  return test('DefaultDiscoverer', {
    matchesNamingConvention: t => {
      t.strictEqual(1, 1)
    },
  })
}
