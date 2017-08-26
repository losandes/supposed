'use strict'
const StreamPrinter = require('./StreamPrinter')
const streamPrinter = new StreamPrinter()

module.exports = Printer

function Printer () {
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

  print.startTest = function () {
    specCount += 1
    testCount = 0
    print(`1..${specCount}`)
  }

  print.success = function (behavior) {
    testCount += 1
    print(`ok ${testCount} - ${behavior}`)
  }

  print.skipped = function (behavior) {
    testCount += 1
    print(`ok ${testCount} # skip ${behavior}`)
  }

  print.failed = function (behavior, e) {
    testCount += 1
    print(`not ok ${testCount} - ${behavior}`)
    optionallyPrintError(e)
  }

  print.broken = function (behavior, e) {
    testCount += 1
    print(`not ok ${testCount} - ${behavior}`)
    optionallyPrintError(e)
    print(`bail out! ${e && e.message}`)
  }

  print.info = function (behavior, e) {
    print(`# ${behavior} \n`)
    optionallyPrintError(e)
  }

  function optionallyPrintError (e) {
    if (e && e.expected && e.actual) {
      print(`# expected: ${e.expected}  actual: ${e.actual}\n`)
    }

    if (e) {
      print(`# ${e.message} \n`)
      print(`# ${e.stack} \n`)
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
