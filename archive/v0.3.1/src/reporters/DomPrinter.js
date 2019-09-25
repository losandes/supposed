'use strict'

module.exports = {
  name: 'DomPrinter',
  factory: DomPrinter
}

function makeTestElement (input) {
  const icon = document.createElement('td')
  icon.append(input.symbol)
  icon.setAttribute('class', 'supposed_icon supposed_color_' + input.status)

  const behavior = document.createElement('td')
  behavior.setAttribute('class', 'supposed_behavior supposed_status_' + input.status)

  if (input.status === 'stack') {
    const lines = input.line.split('\n')
    lines.forEach((ln) => {
      behavior.append(ln)
      behavior.appendChild(document.createElement('br'))
    })
  } else {
    behavior.append(input.line)
  }

  const row = document.createElement('tr')
  row.setAttribute('class', 'supposed_test supposed_status_' + input.status)
  row.appendChild(icon)
  row.appendChild(behavior)

  return row
}

function makeSummaryElement (input) {
  const element = document.createElement('span')
  element.append(input.name + ':' + input.value)
  element.setAttribute('class', 'supposed_summary_item supposed_summary_' + input.name + ' supposed_color_' + input.color)

  return element
}

function DomPrinter (styles, SYMBOLS) {
  var specCount = 0
  var printerOutput = []

  const reportDiv = document.createElement('div')
  reportDiv.setAttribute('class', 'supposed_report')
  document.body.appendChild(reportDiv)

  const reportTable = document.createElement('table')
  reportTable.setAttribute('class', 'supposed_report')
  reportDiv.appendChild(reportTable)

  var print = function print (status, line) {
    if (line) {
      printerOutput.push(line)
      reportTable.appendChild(makeTestElement({
        status: status,
        symbol: SYMBOLS[status] || '   ',
        line: line
      }))
    }
  }

  print.start = function (message) {
    specCount += 1

    if (specCount === 1) {
      print(message)
    }
  }

  print.startTest = function (message) {
    /* suppress */
  }

  print.success = function (behavior) {
    print('passed', behavior)
  }

  print.skipped = function (behavior) {
    print('skipped', behavior)
  }

  print.failed = function (behavior, e) {
    print('failed', behavior)

    if (e && e.expected && e.actual) {
      print('info', '    expected: '.concat(e.expected, '    actual: ').concat(e.actual))
    }

    if (e && e.stack) {
      print('stack', e.stack)
    } else if (e) {
      print('stack', e.message)
    }
  }

  print.broken = print.failed

  print.info = function (behavior, e) {
    print('info', behavior)

    if (e && e.expected && e.actual) {
      print('info', '    expected: '.concat(e.expected, '    actual: ').concat(e.actual))
    }

    if (e && e.stack) {
      print('stack', e.stack)
    } else if (e) {
      print('stack', e.message)
    }
  }

  print.totals = function (totals) {
    var total

    if (totals.failed > 0) {
      total = {
        name: 'total',
        value: totals.total,
        color: 'failed'
      }
    } else {
      total = {
        name: 'total',
        value: totals.total,
        color: 'passed'
      }
    }

    var summary = document.createElement('div')
    summary.setAttribute('class', 'supposed_summary')
    summary.appendChild(makeSummaryElement(total))
    summary.appendChild(makeSummaryElement({
      name: 'passed',
      value: totals.passed,
      color: 'passed'
    }))
    summary.appendChild(makeSummaryElement({
      name: 'failed',
      value: totals.failed,
      color: totals.failed > 0 ? 'failed' : 'info'
    }))
    summary.appendChild(makeSummaryElement({
      name: 'skipped',
      value: totals.skipped,
      color: totals.skipped > 0 ? 'skipped' : 'info'
    }))
    summary.appendChild(makeSummaryElement({
      name: 'duration',
      value: (totals.endTime - totals.startTime) / 1000 + 's',
      color: 'info'
    }))
    reportDiv.prepend(summary)
  }

  print.end = function (message) {
    print('info', message)
  }

  return Object.freeze({
    name: 'DOM',
    print: print,
    newLine: styles && typeof styles.newLine === 'function' ? styles.newLine() : '\n',
    getOutput: () => { return printerOutput.join('\n') }
  })
}
