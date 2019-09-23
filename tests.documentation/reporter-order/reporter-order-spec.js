const supposed = require('supposed')
const test = supposed.suites['reporter-order'] || supposed

module.exports = test({
  'test 1': () => new Promise((resolve) => {
    setTimeout(() => resolve(), 100)
  }),
  'test 2': () => new Promise((resolve) => {
    setTimeout(() => resolve(), 200)
  }),
  'test 3': () => new Promise((resolve) => {
    setTimeout(() => resolve(), 50)
  }),
  'test 4': () => new Promise((resolve) => {
    setTimeout(() => resolve(), 0)
  }),
  'test 5': () => new Promise((resolve) => {
    resolve()
  })
})
