module.exports = {
  name: 'JsonFormatter',
  factory: (dependencies) => {
    'use strict'

    const { TestEvent } = dependencies

    const cloneWithoutOrder = (event) => {
      const clone = JSON.parse(JSON.stringify(event))

      if (clone.plan && Array.isArray(clone.plan.order)) {
        delete clone.plan.order
      }

      return clone
    }

    const stringify = (event) => {
      let _event = event
      if ([
        TestEvent.types.START,
        TestEvent.types.END
      ].indexOf(event.type) > -1) {
        _event = cloneWithoutOrder(event)
      }

      return `${JSON.stringify({ event: _event }, null, 2)}`
    }

    function JsonFormatter () {
      const format = (event) => {
        if (event.type === TestEvent.types.START) {
          return `[${stringify(event)},`
        } else if (event.type === TestEvent.types.END) {
          return `${stringify(event)}]`
        } else if (
          [
            TestEvent.types.START_TEST,
            TestEvent.types.END_TALLY
          ].indexOf(event.type) === -1 &&
          !event.isDeterministicOutput
        ) {
          return `${stringify(event)},`
        } else if (event.isDeterministicOutput) {
          let output = event.testEvents.map((_event) => stringify(_event)).join(',\n')
          output += `,\n${stringify(event.endEvent)}]`
          return output
        }
      }

      return { format }
    }

    return { JsonFormatter }
  }
}
