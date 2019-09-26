module.exports = (test) => {
  return test('DefaultDiscoverer', {
    'ignorespec': t => {
      t.strictEqual(1, 1)
    }
  })
}
