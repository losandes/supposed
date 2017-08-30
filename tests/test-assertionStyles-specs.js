const describe = require('../index.js')

describe('assertion styles', {
  'when the assertions don\'t curry': {
    when: (resolve) => { resolve(42) },
    'it should support one big func': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual, 42)
    }
  },
  'when the assertions curry': {
    when: (resolve) => { resolve(42) },
    'it should support currying': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual, 42)
    }
  },
  'when the assertions ingore the results of when': {
    when: (resolve) => { resolve(42) },
    'it should support just accepting the assertion library': (t) => {
      t.equal(1, 1)
    }
  }
}) // /describe
