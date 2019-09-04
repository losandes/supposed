module.exports = {
  name: 'JsonReporter',
  factory: (dependencies) => {
    'use strict'

    const { TestEvent } = dependencies

    function JsonReporter () {
      const write = async (event) => {
        if (event.type === TestEvent.types.START) {
          console.log(`[${JSON.stringify({ event }, null, 2)},`)
        } else if (event.type === TestEvent.types.END) {
          console.log(`${JSON.stringify({ event }, null, 2)}]`)
        } else if ([TestEvent.types.END_TALLY].indexOf(event.type) === -1) {
          console.log(`${JSON.stringify({ event }, null, 2)},`)
        }
      } // /write

      return { write }
    }

    return { JsonReporter }
  }
}
