// module.exports = (test) => {
//   return test('xunit style', (t) => { t.strictEqual(1, 1) })
// }

const test = require('../index')

test('xunit style', (t) => { t.strictEqual(1, 1) })
