const db = {} // require('./db')
const supposed = require('supposed')

const suite1 = supposed.Suite({
  name: 'unit-tests',
  reporter: 'noop'
}).runner({
  // directories: ['unit-tests']
})

const suite2 = supposed.Suite({
  name: 'integration-tests',
  reporter: 'noop',
  inject: {
    db
  }
}).runner({
  // directories: ['integration-tests']
})

Promise.all([suite1.run(), suite2.run()], (results) => {
  console.log(results)
})
