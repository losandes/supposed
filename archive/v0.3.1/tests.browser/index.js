require('../dist/supposed.js')
const supposed = window.supposed
const suite = supposed.Suite({
  reporter: supposed.reporters.tap,
  assertionLibrary: require('chai').expect
})
require('./sample-specs.js')(suite)

// const server = require('./server')
// server.start([
//   '/tests.browser/sample-specs.js'
// ])
