'use strict'

module.exports = Printer

function Printer (styles) {
  var print = function () { /* suppressed */ }

  print.start = print
  print.startTest = print
  print.success = print
  print.skipped = print
  print.failed = print
  print.broken = print
  print.info = print
  print.totals = print
  print.end = print

  return Object.freeze({
    print: print,
    newLine: styles.newLine()
  })
}
