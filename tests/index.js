const chai = require('chai')
const path = require('path')
const supposed = require('../index.js')
const suite = supposed.Suite({
  name: 'supposed-tests',
  exit: (results) => results,
  inject: {
    describe: supposed,
    chai,
    path,
    defaultConfig: {
      reporter: 'ARRAY',
      exit: (results) => results,
      match: null
    }
  }
})

// suite.subscribe((event) => {
//   console.log(event)
// })

module.exports = suite.runner({
  cwd: path.join(__dirname),
  matchesIgnoredConvention: /discoverer-meta-specs|node_modules/i
})
  .run()
  .then((results) => process.exit(results.totals.failed))
  // .plan()
  // .then((plan) => {
  //   console.log(plan)
  // })
