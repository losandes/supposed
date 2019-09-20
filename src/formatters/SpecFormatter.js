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
      INFO: consoleStyles.cyan('# ')
    }
    const { format, formatDuration, formatInfo, formatExpectedAndActual, formatStack } = DefaultFormatter({ SYMBOLS })

    const addToSpec = (parts, spec, event) => {
      if (!parts.length) {
        return
      }

      const part = parts.shift().trim()

      if (parts.length) {
        spec[part] = spec[part] || {}
        addToSpec(parts, spec[part], event)
      } else {
        spec[part] = event
      }
    }

    const makeSpec = (order, specs) => {
      const spec = {}
      const SPACE = [...new Array(order.length * 2)].join(space)

      specs.sort((a, b) => {
        let aIdx; let bIdx; let foundCount = 0

        for (let i = 0; i < order.length; i += 1) {
          if (order[i] === makeOrderId(a)) {
            aIdx = i
            foundCount += 1
          } else if (order[i] === makeOrderId(b)) {
            bIdx = i
            foundCount += 1
          }

          if (foundCount === 2) {
            break
          }
        }

        if (aIdx < bIdx) {
          return -1
        }
        if (aIdx > bIdx) {
          return 1
        }
        // a must be equal to b
        return 0
      }).forEach((event) => addToSpec(event.behavior.split(','), spec, event))

      return { spec, SPACE }
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
            line = `${SYMBOLS[event.status]}${key} (${formatDuration(event.duration)})${formatInfo(event.log)}`
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

    const makeOrderId = (event) => `${event.batchId}-${event.testId}`

    function SpecFormatter () {
      const order = []
      const specs = []

      const _format = (event) => {
        if (event.type === TestEvent.types.START) {
          return format(event)
        } else if (event.type === TestEvent.types.END) {
          const { spec, SPACE } = makeSpec(order, specs)
          return `${toPrint(spec, SPACE)}${newLine}${format(event)}`
        } else if (event.type === TestEvent.types.START_TEST) {
          order.push(makeOrderId(event))
        } else if (event.type === TestEvent.types.TEST) {
          specs.push(event)
        }
      } // /format

      return { format: _format, makeSpec, makeOrderId }
    } // /Formatter

    return { SpecFormatter }
  }
}
