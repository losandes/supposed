const test = require('../../index')

test('my subject', {
  arrange: (resolve, reject) => {
    // given / arrange / set up
    return resolve(42)
  },
  act: (resolve, reject) => (given) => {
    // act / execute behavior
    return resolve(given)
  },
  'it should run `given`, `when`, and then the assertions':
    (assert) => (err, actual) => {
      assert.ifError(err)
      assert.equal(actual, 42)
    }
})
