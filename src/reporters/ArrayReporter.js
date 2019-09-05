module.exports = {
  name: 'ArrayReporter',
  factory: () => {
    'use strict'

    function ArrayReporter () {
      const events = []
      const write = async (event) => events.push(event)

      return { write, events }
    }

    return { ArrayReporter }
  }
}
