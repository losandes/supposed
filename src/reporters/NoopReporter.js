module.exports = {
  name: 'NoopReporter',
  factory: () => {
    'use strict'

    function NoopReporter () {
      return { write: async () => {} }
    }

    return { NoopReporter }
  }
}
