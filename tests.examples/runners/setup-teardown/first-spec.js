// ./first-module/first-spec.js
const test = require('supposed').suites['supposed-docs.setup-and-teardown']
const { someRepo } = test.dependencies

module.exports = test('when something is inserted in the db', {
  given: () => {
    return { id: 3, foo: 'foo' }
  },
  when: async (obj) => {
    await someRepo.set(obj)
    return obj
  },
  'it should be retrievable': (expect) => async (err, expected) => {
    expect(err).to.equal(null)
    expect(await someRepo.get(expected.id)).to.deep.equal(expected)

    return {
      context: {
        testIds: [expected.id]
      }
    }
  }
})
