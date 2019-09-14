module.exports = {
  name: 'MarkdownFormatter',
  factory: (dependencies) => {
    'use strict'

    const { consoleStyles, TestEvent } = dependencies
    const newLine = consoleStyles.newLine()

    const addToMd = (parts, md) => {
      if (!parts.length) {
        return
      }

      const part = parts.shift().trim()
      md[part] = md[part] || {}

      if (parts.length) {
        addToMd(parts, md[part])
      }
    }

    const space = '                                                               '

    const toBullets = (md, layer) => {
      if (typeof layer === 'undefined') layer = 0
      let output = ''

      Object.keys(md).forEach((key) => {
        const line = key.replace(/\n/g, newLine + space.substring(0, (layer + 1) * 2))
        output += space.substring(0, layer * 2) + `* ${line}${newLine}`
        output += toBullets(md[key], layer + 1)
      })

      return output
    }

    const totals = (totals) => {
      return `## Totals${newLine}` +
             `${newLine}- **total**: ${totals.total}` +
             `${newLine}- **passed**: ${totals.passed}` +
             `${newLine}- **failed**: ${totals.failed}` +
             `${newLine}- **skipped**: ${totals.skipped}` +
             `${newLine}- **duration**: ${(totals.endTime - totals.startTime) / 1000}s`
    }

    function MarkdownFormatter () {
      let title = 'Tests'
      const md = {}

      const format = (event) => {
        if (event.type === TestEvent.types.START) {
          title = event.suiteId
        } else if (event.type === TestEvent.types.END) {
          return `# ${title}${newLine}${newLine}${toBullets(md)}${newLine}${totals(event.totals)}`
        } else if (event.type === TestEvent.types.INFO) {
          // should we include info?
          // return `# ${event.behavior}${formatInfo(event.behavior, event.log, 'comment')}`
        } else if (event.type === TestEvent.types.TEST) {
          addToMd(event.behavior.split(','), md)
        }
      } // /format

      return { format }
    } // /Formatter

    return { MarkdownFormatter }
  }
}
