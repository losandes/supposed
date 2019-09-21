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
          ].indexOf(event.type) === -1 &&
          !event.isDeterministicOutput
        ) {
          return `${JSON.stringify({ event }, null, 2)},`
        } else if (event.isDeterministicOutput) {
          let output = event.testEvents.map((_event) => `${JSON.stringify({ event: _event }, null, 2)}`).join(',\n')
          output += `,\n${JSON.stringify({ event: event.endEvent }, null, 2)}]`
          return output
        }
      }

      return { format }
    }

    return { JsonFormatter }
  }
}
