const describe = require('../../index.js')
// const sut = describe.Suite({ reporter: 'QUIET', timeout: 10 })
describe({
  'when a timeout is set': {
    timeout: 5,
    when: () => {},
    'it should use it': (t) => {
      t.fail('should not get here')
    }
  }
})
