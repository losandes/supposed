module.exports = require('supposed')
  .configure({ name: 'foo', inject: { one: 'one', two: 'two' } }) // optional
  .runner({ cwd: __dirname })
  .run()
