const describe = require('../../index.js')
// const sut = describe.Suite({ reporter: 'QUIET', timeout: 10 })
describe({
  'when a timeout is set': {
    when: (resolve) => {

    },
    'it should use it': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual, 43)
    }
  }
})
