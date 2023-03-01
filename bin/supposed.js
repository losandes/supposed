#!/usr/bin/env node

const supposed = require('supposed')

supposed.Suite().runner().run()
  .then((results) => {
    if (results.totals.failed > 0) {
      process.exit(results.totals.failed)
    }
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err)
    process.exit(1)
  })
