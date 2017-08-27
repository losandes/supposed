'use strict'
module.exports = ReporterFactory

function ReporterFactory (reporters) {
  var types = {}

  Object.keys(reporters).forEach(reporter => {
    types[reporter] = reporter
  })
  return {
    get: (name) => {
      return reporters[name] || reporters.DEFAULT
    },
    types: types
  }
}
