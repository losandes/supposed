'use strict'

module.exports = Printer

function Printer (defaultPrinter) {
  var self = Object.assign({}, defaultPrinter)
  self.print.success = function () { /* suppressed */ }
  self.print.skipped = function () { /* suppressed */ }
  self.print.info = function () { /* suppressed */ }

  return Object.freeze(self)
}
