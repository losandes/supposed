const { expect } = require('chai')

module.exports = (describe) => {
  const it = describe

  describe('when using supposed with mocha tests', function () {
    // NOTE there is no before, or after - supposedtests are chainable promises
    it('it should run the tests, but it wont nest the descriptions', function () {
      expect(1).to.equal(1)
    })
  })
}
