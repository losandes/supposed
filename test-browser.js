const suite = require('./tests.browser/server')
module.exports = suite.then((context) => {
  context.server.close()

  if (context.lastEvent.totals.failed > 0) {
    process.exit(context.lastEvent.totals.failed)
  }
})
