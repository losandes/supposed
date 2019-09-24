module.exports = require('supposed').Suite({
  name: 'docs'
}).runner({
  cwd: __dirname,
  injectSuite: false
}).run()
