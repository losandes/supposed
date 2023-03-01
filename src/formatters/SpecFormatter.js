module.exports = {
  name: 'SpecFormatter',
  factory: (dependencies) => {
    'use strict'

    const { consoleStyles, TestEvent, DefaultFormatter } = dependencies
    const newLine = consoleStyles.newLine()
    const space = consoleStyles.space()
    const SYMBOLS = {
      PASSED: consoleStyles.green('✓ '), // heavy-check: '✔',
      FAILED: consoleStyles.red('✗ '), // heavy-x '✘',
      BROKEN: consoleStyles.red('!= '), // heavy-x '✘',
      SKIPPED: consoleStyles.yellow('⸕ '),
      INFO: consoleStyles.cyan('# '),
    }
    const { format, formatInfo, formatExpectedAndActual, formatStack } = DefaultFormatter({ SYMBOLS })

    const addToSpec = (parts, spec, event) => {
      if (!parts.length) {
        return
      }

      const part = parts.shift()

      if (parts.length) {
        spec[part] = spec[part] || {}
        addToSpec(parts, spec[part], event)
      } else {
        spec[part] = event
      }
    }

    const toPrint = (spec, SPACE, layer) => {
      if (typeof layer === 'undefined') layer = 0
      let output = ''

      // use getOwnPropertyNames instead of keys because the order is guarnateed back to es2015
      // (Object.keys order is guaranteed in es6 and newer)
      Object.getOwnPropertyNames(spec).forEach((key) => {
        if (spec[key].type && spec[key].type === TestEvent.types.TEST) {
          const event = spec[key]
          let line
          if (!event.error) {
            line = `${SYMBOLS[event.status]}${key}${formatInfo(event.log)}`
          } else if (event.error.expected && event.error.actual) {
            line = `${SYMBOLS[event.status]}${key}${newLine}${newLine}` +
              formatExpectedAndActual(event.error) +
              formatStack(event.error)
          } else {
            line = `${SYMBOLS[event.status]}${key}` +
              formatStack(event.error)
          }

          output += SPACE.substring(0, layer * 2) + `${line}${newLine}`
        } else {
          const line = key.replace(/\n/g, newLine + SPACE.substring(0, (layer + 1) * 2))
          output += SPACE.substring(0, layer * 2) + `${line}${newLine}`
          output += toPrint(spec[key], SPACE, layer + 1)
        }
      })

      return output
    }

    function SpecFormatter () {
      const _format = (event) => {
        if (event.type === TestEvent.types.START) {
          return format(event)
        } else if (event.isDeterministicOutput) {
          const SPACE = [...new Array(event.testEvents.length * 2)].join(space)
          const spec = {}
          event.testEvents.forEach((_event) => addToSpec(_event.behaviors, spec, _event))

          return `${toPrint(spec, SPACE)}${newLine}${format(event.endEvent)}`
        }
      } // /format

      return { format: _format, addToSpec }
    }

    return { SpecFormatter }
  },
}
