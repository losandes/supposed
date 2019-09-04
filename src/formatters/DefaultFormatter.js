module.exports = {
  name: 'DefaultFormatter',
  factory: (dependencies) => {
    'use strict'

    const { consoleStyles, TestEvent, SYMBOLS } = dependencies
    const newLine = consoleStyles.newLine()

    const formatInfo = (log) => {
      if (typeof log === 'undefined') {
        return ''
      }

      return newLine + JSON.stringify(log, null, 2).split(newLine)
        .map((line) => `    ${line}`)
        .join(newLine)
    }

    const formatComparable = (input) => {
      let output = JSON.stringify(input, null, 2)

      if (input && !output) {
        output = input.toString()
      }

      if (output.indexOf(newLine) > -1) {
        return output.split(newLine)
          .map((line) => `    ${line}`)
          .join(newLine)
          .substring(4) + newLine
      }

      return output
    }

    const formatExpectedAndActual = (error) => {
      return `    expected: ${consoleStyles.green(formatComparable(error.expected))}` +
             `    actual: ${consoleStyles.red(formatComparable(error.actual))}`
    }

    const formatStack = (error) => {
      if (!error.stack) {
        return ''
      }

      const stack = error.stack.split(newLine)
        .map((line) => `    ${line.trim()}`)
        .join(newLine)

      return error.expected && error.actual
        ? `${newLine}${newLine}${stack}${newLine}`
        : `${newLine}${stack}${newLine}`
    }

    function DefaultFormatter () {
      const format = (event) => {
        if (event.type === TestEvent.types.START) {
          return `${newLine}${SYMBOLS.INFO}Running tests...`
        } if (event.type === TestEvent.types.END) {
          const totals = event.totals
          return `${newLine}${SYMBOLS.INFO}total: ${consoleStyles.cyan(totals.total)}` +
            `  passed: ${consoleStyles.green(totals.passed)}` +
            `  failed: ${consoleStyles.red(totals.failed + totals.broken)}` +
            `  skipped: ${consoleStyles.yellow(totals.skipped)}` +
            `  duration: ${(totals.endTime - totals.startTime) / 1000}${newLine}`
        } else if (event.type === TestEvent.types.INFO) {
          return `${SYMBOLS[event.type]}${event.behavior}${formatInfo(event.log)}`
        } else if (event.type === TestEvent.types.TEST) {
          if (!event.error) {
            return `${SYMBOLS[event.status]}${event.behavior}${formatInfo(event.log)}`
          } else if (event.error.expected && event.error.actual) {
            return `${SYMBOLS[event.status]}${event.behavior}${newLine}${newLine}` +
              formatExpectedAndActual(event.error) +
              formatStack(event.error)
          } else {
            return `${SYMBOLS[event.status]}${event.behavior}` +
              formatStack(event.error)
          }
        }
      } // /format

      return { format }
    } // /Formatter

    return { DefaultFormatter }
  }
}
