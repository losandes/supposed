module.exports = function (test) {
  return test('when dividing a number by zero', {
    when: () => {
      return 42 / 0
    },
    'it should return Infinity': (expect) => (err, actual) => {
      expect(err).to.equal(null)
      expect(actual).to.equal(Infinity)
    }
  })
}
