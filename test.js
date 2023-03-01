const chai = require('chai')
const path = require('path')
const supposed = require('supposed')
const suite = supposed.Suite({
  name: 'tests.node',
  exit: (results) => results,
  inject: {
    describe: supposed,
    chai,
    path,
    defaultConfig: {
      reporter: 'ARRAY',
      exit: (results) => results,
      match: null,
      verbosity: 'info',
    },
  },
})

// suite.subscribe((event) => {
//   console.log(event)
// })

module.exports = suite.runner({
  directories: ['./tests.node', './tests.es'],
  matchesIgnoredConvention: /discoverer-meta-specs|node_modules/i,
})
  // .plan()
  // .then((plan) => { console.log(plan) })
  .run()
  // .then((results) => { console.log(results); return results })
  .then((results) => {
    if (results.totals.failed > 0) {
      process.exit(results.totals.failed)
    }
  })
