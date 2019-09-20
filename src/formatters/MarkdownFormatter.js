module.exports = {
  name: 'MarkdownFormatter',
  factory: (dependencies) => {
    'use strict'

    const { consoleStyles, TestEvent, SpecFormatter, DefaultFormatter } = dependencies
    const newLine = consoleStyles.newLine()
    const { makeOrderId, makeSpec } = new SpecFormatter()
    const { formatDuration } = new DefaultFormatter()

    const toBullets = (md, SPACE, layer) => {
      if (typeof layer === 'undefined') layer = 0
      let output = ''

      Object.keys(md).forEach((key) => {
        const line = key.replace(/\n/g, newLine + SPACE.substring(0, (layer + 1) * 2))
        output += SPACE.substring(0, layer * 2) + `* ${line}${newLine}`

        if (md[key].type && md[key].type === TestEvent.types.TEST) {
          // done
        } else {
          output += toBullets(md[key], SPACE, layer + 1)
        }
      })

      return output
    }

    const makeTotalsH2 = (totals) => {
      return `## Totals${newLine}` +
             `${newLine}- **total**: ${totals.total}` +
             `${newLine}- **passed**: ${totals.passed}` +
             `${newLine}- **failed**: ${totals.failed}` +
             `${newLine}- **skipped**: ${totals.skipped}` +
             `${newLine}- **duration**: ${formatDuration(totals.duration)}`
    }

    const makeErrorsH2 = (specs) => {
      const found = specs.filter((event) =>
        event.status === TestEvent.status.FAILED ||
        event.status === TestEvent.status.BROKEN
      )

      if (!found.length) {
        return
      }

      let output = `## Errors${newLine}`

      found.forEach((event) => {
        if (event.error && event.error.stack) {
          output += `${newLine}${event.behavior}${newLine}` +
            '```' +
            `${newLine}${event.error.stack}${newLine}` +
            '```' +
            newLine
        } else {
          output += `${newLine}${event.behavior}${newLine}`
        }
      })

      return output
    }

    function MarkdownFormatter () {
      let title = 'Tests'
      const order = []
      const specs = []

      const format = (event) => {
        if (event.type === TestEvent.types.START) {
          title = event.suiteId
        } else if (event.type === TestEvent.types.END) {
          const { spec, SPACE } = makeSpec(order, specs)
          const errors = makeErrorsH2(specs)

          if (errors) {
            return `# ${title}${newLine}${newLine}${toBullets(spec, SPACE)}${newLine}${errors}${newLine}${makeTotalsH2(event.totals)}`
          } else {
            return `# ${title}${newLine}${newLine}${toBullets(spec, SPACE)}${newLine}${makeTotalsH2(event.totals)}`
          }
        } else if (event.type === TestEvent.types.START_TEST) {
          order.push(makeOrderId(event))
        } else if (event.type === TestEvent.types.TEST) {
          specs.push(event)
        }
      } // /format

      return { format }
    } // /Formatter

    return { MarkdownFormatter }
  }
}
