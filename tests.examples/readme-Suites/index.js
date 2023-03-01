const db = {} // require('./db')
const supposed = require('supposed')
const path = require('path')

const suite1 = supposed.Suite({
  name: 'unit-tests'
}).runner({
  cwd: path.join(__dirname, 'unit-tests')
})

const suite2 = supposed.Suite({
  name: 'integration-tests',
  inject: { db }
}).runner({
  cwd: path.join(__dirname, 'integration-tests')
})

Promise.allSettled([suite1.run(), suite2.run()])
  .then((results) => {
    console.log('results:', results)
  })
  .catch((err) => {
    console.log('err:', err)
  })

// node tests.examples/readme-Suites/index.js -r noop
