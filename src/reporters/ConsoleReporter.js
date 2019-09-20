module.exports = {
  name: 'ConsoleReporter',
  factory: (dependencies) => {
    'use strict'

    const { TestEvent, formatter } = dependencies
    const { format } = formatter

    function ConsoleReporter () {
      const write = (event) => {
        if ([
          TestEvent.types.START,
          TestEvent.types.START_TEST,
          TestEvent.types.TEST,
          TestEvent.types.INFO,
          TestEvent.types.END
        ].indexOf(event.type) > -1) {
          const line = format(event)

          if (line) {
            console.log(line)
          }
        }
      } // /write

      return { write }
    }

    return { ConsoleReporter }
  }
}
