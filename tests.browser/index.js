const suite = require('./server')
suite.then((context) => {
  context.server.close()
  process.exit(context.lastEvent.totals.failed)
})
