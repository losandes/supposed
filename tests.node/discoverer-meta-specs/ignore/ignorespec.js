module.exports = (test) => {
  return test('DefaultDiscoverer', {
    'ignore/ignorespec': t => {
      t.strictEqual(1, 1)
    },
  })
}
