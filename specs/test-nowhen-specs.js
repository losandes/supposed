const describe = require('../index.js')

// TODO

describe('assay', {
  'when there is no when function': {
    'it should still execute the assertions': t => {
      t.equal(true, true)
    },
    'and assertions are deeply nested': {
      'it should still execute the assertions': t => {
        t.equal(true, true)
      },
      'inside of other deep nests': {
        'it should still execute the assertions': t => {
          t.equal(true, true)
        }
      }
    }
  }
})
