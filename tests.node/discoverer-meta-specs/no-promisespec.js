module.exports = (test) => {
  test('DefaultDiscoverer', {
    'no-promisespec': expect => {
      expect(1).to.equal(1)
    },
  })
}
