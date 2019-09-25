'use strict'

module.exports = {
  name: 'Reporter',
  factory: Reporter
}

function Reporter (reporter) {
  return Object.assign({
    report: () => {},
    getTotals: () => {},
    getResults: () => {},
    getPrinterOutput: () => {}
  }, reporter)
}
