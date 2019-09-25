const chai = require('chai')
const path = require('path')
const supposed = require('../index.js')

supposed.Suite({
  name: 'supposed-tests.manual',
  inject: {
    describe: supposed,
    chai,
    path
  }
}).runner({
  cwd: __dirname,
  matchesIgnoredConvention: /discoverer-meta-specs|node_modules/i
}).run()
// .then((context) => {
//   console.log(context)
// })
