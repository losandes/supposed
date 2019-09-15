// ./first-module/first-suite.js
const { expect } = require('chai')
const suite = require('supposed').Suite({
  name: 'supposed-tests.first-module',
  inject: { expect },
  reporter: 'noop'
})

module.exports = {
  suite,
  runner: suite.runner({
    cwd: __dirname
  })
}
