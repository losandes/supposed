const supposed = require('supposed')

module.exports = supposed.Suite({
  reporter: (event) => console.log(event)
}).runner({ cwd: __dirname })
  .run()

module.exports = supposed.Suite({
  reporter: 'noop'
}).subscribe((event) => console.log(event))
  .runner({ cwd: __dirname })
  .run()
