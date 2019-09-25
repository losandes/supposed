// ./second-module/second-spec.js
const test = require('supposed').suites['supposed-docs.setup-and-teardown']
const { someRepo } = test.dependencies

module.exports = test('when something is retrieved frome the db', {
  given: async () => {
    const expected = { id: 4, foo: 'foo' }
    await someRepo.set(expected)
    return expected
  },
  when: async (expected) => {
    const actual = await someRepo.get(expected.id)
    return { expected, actual }
  },
  'it should return the object': (expect) => (err, { expected, actual }) => {
    expect(err).to.equal(null)
    expect(actual).to.deep.equal(expected)

    return {
      context: {
        testIds: [expected.id]
      }
    }
  }
})
