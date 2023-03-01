module.exports = (test) => {
  return test('DefaultDiscoverer', {
    nestspec: t => {
      t.strictEqual(1, 1)
    },
  })
}
