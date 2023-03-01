module.exports = {
  name: 'MarkdownFormatter',
  factory: (dependencies) => {
    'use strict'

    const { consoleStyles, TestEvent, SpecFormatter, DefaultFormatter } = dependencies
    const newLine = consoleStyles.newLine()
    const space = consoleStyles.space()
    const { addToSpec } = new SpecFormatter()
    const { formatDuration } = new DefaultFormatter()
    const STARTS_WITH_HEADING = /^#/

    const escape = (behavior) => {
      if (STARTS_WITH_HEADING.test(behavior)) {
        return behavior.substring(behavior.indexOf(' ') + 1)
      }

      return behavior
    }

    const toBullets = (md, SPACE, layer) => {
      if (typeof layer === 'undefined') layer = 0
      let output = ''

      Object.keys(md).forEach((key) => {
        const line = key.replace(/\n/g, newLine + SPACE.substring(0, (layer + 1) * 2))
        output += SPACE.substring(0, layer * 2) + `-   ${escape(line)}${newLine}`

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

    const makeInfoH2 = (specs) => {
      const found = specs.filter((event) =>
        event.status === TestEvent.status.PASSED &&
        event.log,
      )

      if (!found.length) {
        return
      }

      let output = `## Details${newLine}`

      found.forEach((event) => {
        output += `${newLine}#### ${escape(event.behavior)}${newLine}${newLine}` +
          '```JSON' +
          `${newLine}${JSON.stringify(event.log, null, 2)}${newLine}` +
          '```' +
          newLine
      })

      return output
    }

    const makeErrorsH2 = (specs) => {
      const found = specs.filter((event) =>
        event.status === TestEvent.status.FAILED ||
        event.status === TestEvent.status.BROKEN,
      )

      if (!found.length) {
        return
      }

      let output = `## Errors${newLine}`

      found.forEach((event) => {
        if (event.error && event.error.stack) {
          output += `${newLine}#### ${escape(event.behavior)}${newLine}${newLine}` +
            '```' +
            `${newLine}${event.error.stack}${newLine}` +
            '```' +
            newLine
        } else {
          output += `${newLine}#### ${escape(event.behavior)}${newLine}`
        }
      })

      return output
    }

    function MarkdownFormatter () {
      let title = 'Tests'

      const format = (event) => {
        if (event.type === TestEvent.types.START) {
          title = event.suiteId
        } else if (event.isDeterministicOutput) {
          const SPACE = [...new Array(event.testEvents.length * 2)].join(space)
          const spec = {}
          event.testEvents.forEach((_event) => addToSpec(_event.behaviors, spec, _event))
          const errors = makeErrorsH2(event.testEvents)
          const logs = makeInfoH2(event.testEvents)

          if (errors && logs) {
            return `# ${title}${newLine}${newLine}${toBullets(spec, SPACE)}${newLine}${logs}${newLine}${errors}${newLine}${makeTotalsH2(event.endEvent.totals)}`
          } else if (errors) {
            return `# ${title}${newLine}${newLine}${toBullets(spec, SPACE)}${newLine}${errors}${newLine}${makeTotalsH2(event.endEvent.totals)}`
          } else if (logs) {
            return `# ${title}${newLine}${newLine}${toBullets(spec, SPACE)}${newLine}${logs}${newLine}${makeTotalsH2(event.endEvent.totals)}`
          } else {
            return `# ${title}${newLine}${newLine}${toBullets(spec, SPACE)}${newLine}${makeTotalsH2(event.endEvent.totals)}`
          }
        }
      } // /format

      return { format }
    } // /Formatter

    return { MarkdownFormatter }
  },
}
