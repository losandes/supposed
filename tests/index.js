const chai = require('chai')
const path = require('path')
const supposed = require('../index.js')
const suite = supposed.Suite({
  env: {
    describe: supposed,
    chai,
    path
  }
})

suite.runner({
  cwd: __dirname, // this will ignore the tests.browser directory, etc.
  matchesIgnoredConvention: /discoverer-meta-specs|node_modules/i
}).run()
// .then((context) => {
//   console.log(context.files)
// })
