module.exports = require('supposed')
  .configure({ name: 'foo', inject: { foo: 'bar' } })
  .runner({ cwd: __dirname })
  .run()
