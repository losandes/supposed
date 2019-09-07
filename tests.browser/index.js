const suite = require('./server')
suite.then((context) => {
  context.server.close()
})
