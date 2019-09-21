module.exports = {
  name: 'TapFormatter',
  factory: (dependencies) => {
    'use strict'

    const { consoleStyles, TestEvent } = dependencies
    const newLine = consoleStyles.newLine()
    const whitespace = '        '

    const reIndent = (input, spaces, trim) => {
      const indent = whitespace.substring(0, spaces)
      return input.split(newLine)
        .map((line) => `${indent}${trim ? line.trim() : line}`)
        .join(newLine)
        .substring(spaces)
    }

    const formatMessage = (input) => {
      const message = input.split(newLine)
        .map((line) => line.replace(/\s\s+/g, ' ').replace(/"/g, '\\"'))
        .join(' ')

      return `"${message}"`
    }

    const formatInfo = (behavior, log, severity) => {
      if (typeof log === 'undefined') {
        return ''
      }

      const message = typeof log.message === 'string' ? log.message : `comment for: ${behavior}`

      return newLine +
             `  ---${newLine}` +
             `  message: "${message}"${newLine}` +
             `  severity: ${severity}${newLine}` +
             `  data:${newLine}` +
             `    ${reIndent(JSON.stringify(log, null, 2), 4)}${newLine}` +
             '  ...'
    }

    const formatError = (error, severity) => {
      if (!error) {
        return ''
      }

      const actualAndExpectedExist = error.expected && error.actual
      const stackExists = typeof error.stack === 'string'

      let output = `${newLine}  ---${newLine}` +
        `  message: ${formatMessage(error.message)}${newLine}` +
        `  severity: ${severity}${newLine}`

      if (actualAndExpectedExist && stackExists) {
        output += `  data:${newLine}`
        output += `    got: ${error.actual}${newLine}`
        output += `    expect: ${error.expected}${newLine}`
        output += `    stack: ${reIndent(error.stack, 6, true)}${newLine}`
      } else if (actualAndExpectedExist) {
        output += `  data:${newLine}`
        output += `    got: ${error.actual}${newLine}`
        output += `    expect: ${error.expected}${newLine}`
      } else if (stackExists) {
        output += `  data:${newLine}`
        output += `    stack: ${reIndent(error.stack, 6, true)}${newLine}`
      }

      output += '  ...'

      return output
    }

    function TapFormatter () {
      const formatTest = (event) => {
        switch (event.status) {
          case TestEvent.status.PASSED:
            return `ok ${event.count} - ${event.behavior}${formatInfo(event.behavior, event.log, 'comment')}`
          case TestEvent.status.SKIPPED:
            return event.behavior.indexOf('# TODO') > -1
              ? `ok ${event.count} # TODO ${event.behavior.replace('# TODO ', '')}`
              : `ok ${event.count} # SKIP ${event.behavior}`
          case TestEvent.status.FAILED:
            return `not ok ${event.count} - ${event.behavior}${formatError(event.error, 'fail')}`

          case TestEvent.status.BROKEN:
            return `not ok ${event.count} - ${event.behavior}${formatError(event.error, 'broken')}`
        }
      }

      const format = (event) => {
        if (event.type === TestEvent.types.START) {
          return 'TAP version 13'
        } if (event.type === TestEvent.types.END) {
          return `1..${event.totals.total}`
        } else if (event.type === TestEvent.types.TEST) {
          return formatTest(event)
        } else if (event.isDeterministicOutput) {
          let output = `1..${event.endEvent.totals.total}\n`
          output += event.testEvents.map((_event, idx) =>
            formatTest({ ..._event, ...{ count: idx + 1 } })
          ).join('\n')
          return output
        }
      } // /format

      return { format }
    } // /Formatter

    return { TapFormatter }
  }
}
