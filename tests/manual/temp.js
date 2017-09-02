const test = require('../../index')

const setup = new Promise((resolve, reject) => {
  setTimeout(() => {
    // prepare for running the tests
    resolve()
  }, 0)
})

const teardown = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    // tear down your setup
    resolve()
  }, 0)
})

setup.then(() => {
  return test('divide by zero equals infinity', t => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(42 / 0)
      }, 0)
    }).then(actual => {
      t.equal(actual, Infinity)
    })
  })
}).then(() => {
  teardown()
})


