module.exports = (test) => {
  return test('DefaultDiscoverer', {
    'ignore/other-ignorespec': t => {
      t.strictEqual(1, 1)
    },
  })
}
