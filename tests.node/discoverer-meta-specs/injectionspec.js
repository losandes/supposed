module.exports = (test) => {
  return test('DefaultDiscoverer', {
    'injects correct suite': expect => {
      expect(1).to.equal(1)
    },
  })
}
