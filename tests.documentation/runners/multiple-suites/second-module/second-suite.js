const suite = require('supposed').Suite({
  name: 'supposed-tests.second-module',
  reporter: 'noop'
})

module.exports = {
  suite,
  runner: suite.runner({
    cwd: __dirname
  })
}
