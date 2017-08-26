const tests = require('./sample-tests.js')
const test = require('../index.js')

test(tests)

test('ava compatibility', t => {
  t.equal(1, 1)
})
