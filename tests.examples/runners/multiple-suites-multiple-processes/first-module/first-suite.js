// ./first-module/first-suite.js
const { expect } = require('chai')
const suite = require('supposed').Suite({
  name: 'supposed-tests.first-module',
  inject: { expect },
  reporter: 'json'
})

module.exports = suite.runner({
  cwd: __dirname
}).run()
