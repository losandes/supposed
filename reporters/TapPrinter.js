'use strict'
module.exports = Printer

// http://testanything.org/tap-version-13-specification.html
function Printer (streamPrinter) {
  var printedVersion = false
  var specCount = 0
  var testCount = 0
  var print = streamPrinter.print

  print.start = function () {
    if (!printedVersion) {
      printedVersion = true
      print('TAP version 13')
    }
  }

  print.startTest = function (plan) {
    specCount += 1
    testCount = 0
    print(`${specCount}..${(plan && plan.count) || 1}`)
  }

  print.success = function (behavior) {
    testCount += 1
    print(`ok ${testCount} - ${behavior}`)
  }

  print.skipped = function (behavior) {
    testCount += 1
    print(`ok ${testCount} # SKIP ${behavior}`)
  }

  print.failed = function (behavior, e) {
    testCount += 1
    print(`not ok ${testCount} - ${behavior}`)
    optionallyPrintError(e, 'fail')
  }

  print.broken = function (behavior, e) {
    testCount += 1
    print(`not ok ${testCount} - ${behavior}`)
    optionallyPrintError(e, 'broken')
    // TODO: I'm not sure there is ever a reason to print "bail out!" with this test runner
    // It might be something we tie to `given`?
    print(`bail out! ${e && e.message}`)
  }

  print.info = function (behavior, e) {
    print(`# ${behavior} \n`)
    optionallyPrintError(e, 'info')
  }

  function optionallyPrintError (e, severity) {
    if (e) {
      print('  ---')
      print(`  message: '${e.message}'`)
      print(`  severity: ${severity}`)
      print('  data:')

      if (e.expected && e.actual) {
        print(`    got: ${e.actual}`)
        print(`    expect: ${e.expected}`)
      }

      if (e.stack) {
        let stack = e.stack.replace(/\s{4}at/g, '      at')
        print(`    stack: ${stack}`)
      }

      print('  ...')
    }
  }

  print.totals = function (totals) { /* suppressed */ }
  print.end = function () {
    print(streamPrinter.newLine)
  }

  return Object.freeze({
    print: print,
    newLine: streamPrinter.newLine
  })
}
