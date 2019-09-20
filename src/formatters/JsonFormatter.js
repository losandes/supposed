module.exports = {
  name: 'JsonFormatter',
  factory: (dependencies) => {
    'use strict'

    const { TestEvent } = dependencies

    function JsonFormatter () {
      const format = (event) => {
        if (event.type === TestEvent.types.START) {
          return `[${JSON.stringify({ event }, null, 2)},`
        } else if (event.type === TestEvent.types.END) {
          return `${JSON.stringify({ event }, null, 2)}]`
        } else if (
          [
            TestEvent.types.START_TEST,
            TestEvent.types.END_TALLY
          ].indexOf(event.type) === -1
        ) {
          return `${JSON.stringify({ event }, null, 2)},`
        }
      }

      return { format }
    }

    return { JsonFormatter }
  }
}
