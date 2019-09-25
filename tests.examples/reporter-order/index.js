const test = require('supposed').Suite({ name: 'reporter-order', reportOrder: 'deterministic' })

test.runner({ cwd: __dirname })
  .run()
