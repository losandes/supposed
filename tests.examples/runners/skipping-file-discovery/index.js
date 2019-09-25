module.exports = require('supposed')
  .runner()
  .runTests(() => [
    require('./first-spec'),
    require('./second-spec')
  ])
