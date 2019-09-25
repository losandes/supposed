const runner = require('supposed').runner({ cwd: __dirname })

module.exports = runner.plan()
  .then((context) => {
    context.plan.order = context.plan.order.reverse()
    return context
  })
  .then(runner.runTests)
