const describe = require('../index.js')

describe('// Suite', {
  'when a new suite is created with a timout': {
    'it should use the configured timeout': (t, err, actual) => {

    }
  },
  'when a new suite is created with an assertion library': {
    'it should use the configured assertion library': (t, err, actual) => {

    }
  },
  'when a new suite is created with a reporter name': {
    'it should use the configured reporter': (t, err, actual) => {

    },
    'and the reporter is unknown': {
      'it should use the default reporter': (t, err, actual) => {

      }
    }
  },
  'when a new suite is created with an instance of a reporter': {
    'it should use the configured reporter': (t, err, actual) => {

    }
  }
})
