const test = require('supposed').Suite({ name: 'reporter-order' })

test.runner({ cwd: __dirname })
  .run()
