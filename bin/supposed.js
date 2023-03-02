#!/usr/bin/env node

const supposed = require('supposed')

const suite = supposed.Suite({ reporter: 'noop' })
const runner = suite.runner()
const plan = runner.plan()

plan.then(runner.runTests)
  .then((results) => {
    if (results.broken.length > 0) {
      results.broken.forEach((err) => console.log(err)) // eslint-disable-line no-console
      process.exit(results.broken.length)
    } else if (results.totals.failed > 0) {
      process.exit(results.totals.failed)
    }
  })
  .catch((err) => {
    console.log(err) // eslint-disable-line no-console
    process.exit(1)
  })
