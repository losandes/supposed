'use strict'

module.exports = {
  name: 'BrowserConsolePrinter',
  factory: BrowserConsolePrinter
}

function BrowserConsolePrinter (styles, SYMBOLS) {
  var specCount = 0
  var printerOutput = []
  var print = (line) => {
    printerOutput.push(line)
    console.log(line)
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
    print(SYMBOLS.passed + behavior)
  }

  print.skipped = function (behavior) {
    print(SYMBOLS.skipped + behavior)
  }

  print.failed = function (behavior, e) {
    print(SYMBOLS.failed + behavior)

    if (e && e.expected && e.actual) {
      print(`    expected: ${e.expected}    actual: ${e.actual}`)
    }

    if (e) {
      print(e)
      print('')
    }
  }

  print.broken = print.failed

  print.info = function (behavior, e) {
    print(SYMBOLS.info + behavior)

    if (e && e.expected && e.actual) {
      print(`    expected: ${e.expected}    actual: ${e.actual}`)
    }

    print(e)
    print('')
  }

  print.totals = function (totals) {
    print('  total: ' + totals.total)
    print('  passed: ' + totals.passed)
    print('  failed: ' + totals.failed + totals.broken)
    print('  skipped: ' + totals.skipped)
    print('  duration: ' + ((totals.endTime - totals.startTime) / 1000) + 's')
  }

  print.end = function (message) {
    print(message)
  }

  return Object.freeze({
    name: 'BROWSER_CONSOLE',
    print: print,
    newLine: styles && typeof styles.newLine === 'function' ? styles.newLine() : '\n',
    getOutput: () => { return printerOutput.join('\n') }
  })
}
