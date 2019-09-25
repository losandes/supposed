const path = require('path')

module.exports = require('supposed')
  .configure({ name: 'foo', inject: { foo: 'bar' } }) // optional
  .runner({
    paths: [
      path.join(__dirname, 'setup.js'),
      path.join(__dirname, 'first-spec.js'),
      path.join(__dirname, 'second-spec.js')
    ],
    port: 42004
  })
  .startServer()
