'use strict'

module.exports = Printer

function Printer (styles) {
  const SYMBOLS = {
    passed: styles.green('✓ '), // heavy-check: '✔',
    failed: styles.red('✗ '), // heavy-x '✘',
    skipped: styles.yellow('⸕ '),
    info: styles.cyan('→ ')
  }
  // const SYMBOLS = {
  //   passed: `${styles.bgGreen(styles.black(' PASS '))} `,
  //   failed: `${styles.bgRed(styles.black(' FAIL '))} `,
  //   skipped: `${styles.bgYellow(styles.black(' SKIP '))} `,
  //   info: `${styles.bgCyan(styles.black(' INFO '))} `
  // }
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
    print(SYMBOLS.failed + behavior + styles.newLine())

    if (e && e.expected && e.actual) {
      print(`    expected: ${styles.green(e.expected)}    actual: ${styles.red(e.actual)}${styles.newLine()}`)
    }

    if (e) {
      print(e)
      print()
    }
  }

  print.broken = print.failed

  print.info = function (behavior, e) {
    print(SYMBOLS.info + behavior + styles.newLine())

    if (e && e.expected && e.actual) {
      print('  expected: ' + styles.green(e.expected) + '  actual: ' + styles.red(e.actual) + styles.newLine())
    }

    print(e)
    print()
  }

  print.totals = function (totals) {
    var output = styles.newLine() + '  total: ' + styles.cyan(totals.total)
    output += '  passed: ' + styles.green(totals.passed)
    output += '  failed: ' + styles.red(totals.failed + totals.broken)
    output += '  skipped: ' + styles.yellow(totals.skipped)
    output += '  duration: ' + ((totals.endTime - totals.startTime) / 1000) + 's' + styles.newLine()

    print(output)
  }

  print.end = function (message) {
    print(message)
  }

  return Object.freeze({
    name: 'DEFAULT',
    print: print,
    newLine: styles.newLine(),
    getOutput: () => { return printerOutput.join('\n') }
  })
}
