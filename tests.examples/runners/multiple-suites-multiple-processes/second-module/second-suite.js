// ./second-module/second-suite.js
const suite = require('supposed').Suite({
  name: 'supposed-tests.second-module',
  reporter: 'json'
})

module.exports = suite.runner({
  cwd: __dirname
}).run()
