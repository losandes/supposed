const chai = require('chai')
const path = require('path')
const supposed = require('../index.js')
const suite = supposed.Suite({
  name: 'supposed-tests',
  inject: {
    describe: supposed,
    chai,
    path
  }
})

module.exports = suite.runner({
  cwd: path.join(__dirname),
  matchesIgnoredConvention: /discoverer-meta-specs|node_modules/i
})
  .run()
  // .plan()
  // .then((plan) => {
  //   console.log(plan)
  // })
