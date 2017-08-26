'use strict'

const DefaultPrinter = require('./DefaultPrinter.js')

module.exports = Printer

function Printer () {
  var self = Object.assign({}, new DefaultPrinter())
  self.print.success = function () { /* suppressed */ }
  self.print.skipped = function () { /* suppressed */ }
  self.print.info = function () { /* suppressed */ }

  return Object.freeze(self)
}
