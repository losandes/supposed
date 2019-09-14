module.exports = require('supposed')
  .configure({ name: 'foo', inject: { foo: 'bar' } }) // optional
  .runner()
  .runTests([
    () => require('./first-spec'),
    () => require('./second-spec')
  ])
