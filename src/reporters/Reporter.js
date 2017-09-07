'use strict'

module.exports = Reporter

function Reporter (reporter) {
  return Object.assign({
    report: () => {},
    getTotals: () => {},
    getResults: () => {},
    getPrinterOutput: () => {}
  }, reporter)
}
