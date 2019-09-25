// ./setup.js
module.exports = (test) => {
  test.dependencies = test.dependencies || {}
  test.dependencies.foo = 'bar'
}
