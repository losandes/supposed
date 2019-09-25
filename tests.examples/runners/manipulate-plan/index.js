const suite = require('supposed').Suite({
  reportOrder: 'deterministic'
})
const runner = suite.runner({ cwd: __dirname })

runner.plan()
  .then((context) => {
    // plan.order is only used for deterministic reporting
    // if you prefer non-deterministic ordering, you
    // could sort context.plan.batches instead
    context.plan.order = context.plan.order.reverse()

    // NOTE that the other properties on the context are
    // information only - they have already been used
    // so manipulating them has no effect.

    return context
  })
  .then(runner.runTests)
