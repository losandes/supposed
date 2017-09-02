const test = require('../../index')

test('my subject', {
  given: () => {
    // given / arrange / set up
    return 42
  },
  when: (given) => {
    // act / execute behavior
    console.log('HERE')
    return given
  },
  'it should run `given`, `when`, and then the assertions':
    (expect) => (err, actual) => {
      expect.ifError(err)
      expect.equal(actual, 42)
    }
})

test('my promised when', {
  given: () => {
    // given / arrange / set up
    return new Promise((resolve, reject) => {
      resolve(42)
    })
  },
  when: (given) => {
    // act / execute behavior
    return new Promise((resolve, reject) => {
      resolve(given)
    })
  },
  'it should run `given`, `when`, and then the assertions':
    (expect) => (err, actual) => {
      expect.ifError(err)
      expect.equal(actual, 42)
    }
})

test('my async when', {
  given: async () => {
    // act / execute behavior
    let actual = await new Promise((resolve, reject) => {
      resolve(42)
    })

    return actual
  },
  when: async (given) => {
    // act / execute behavior
    let actual = await new Promise((resolve, reject) => {
      resolve(given)
    })

    return actual
  },
  'it should run `given`, `when`, and then the assertions':
    (expect) => (err, actual) => {
      expect.ifError(err)
      expect.equal(actual, 42)
    }
})
