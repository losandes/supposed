'use strict'

const styles = require('./console-styles.js')

module.exports = Printer

function Printer () {
  var print = function () { /* suppressed */ }

  print.start = print
  print.startTest = print
  print.success = print
  print.skipped = print
  print.failed = print
  print.error = print
  print.info = print
  print.totals = print
  print.end = print

  return Object.freeze({
    print: print,
    newLine: styles.newLine()
  })
}
