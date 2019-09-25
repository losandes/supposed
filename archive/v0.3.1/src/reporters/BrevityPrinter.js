'use strict'

module.exports = {
  name: 'BrevityPrinter',
  factory: BrevityPrinter
}

function BrevityPrinter (defaultPrinter) {
  var self = Object.assign({}, defaultPrinter)
  self.print.success = function () { /* suppressed */ }
  self.print.skipped = function () { /* suppressed */ }
  self.print.info = function () { /* suppressed */ }

  return Object.freeze(self)
}
