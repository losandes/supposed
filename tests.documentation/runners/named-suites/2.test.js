// module.exports = (test) => {
//   return test('when dividing a number by zero', {
//     given: () => 42,
//     when: (number) => { return number / 0 },
//     'it should return Infinity': (then) => (err, actual) => {
//       then.ifError(err)
//       then.strictEqual(actual, Infinity)
//     },
//     'if the number is zero': {
//       given: () => 0,
//       when: (number) => { return number / 0 },
//       'it should return NaN': (then) => (err, actual) => {
//         then.ifError(err)
//         then.strictEqual(isNaN(actual), true)
//       },
//       'it should not be equal to itself': (then) => (err, actual) => {
//         then.ifError(err)
//         then.notEqual(actual, actual)
//       }
//     }
//   })
// }

const test = require('..').suites['supposed-tests.docs']

module.exports = test('(2) when dividing a number by zero', {
  given: () => 42,
  when: (number) => { return number / 0 },
  'it should return Infinity': (then) => (err, actual) => {
    then.ifError(err)
    then.strictEqual(actual, Infinity)
  },
  'if the number is zero': {
    given: () => 0,
    when: (number) => { return number / 0 },
    'it should return NaN': (then) => (err, actual) => {
      then.ifError(err)
      then.strictEqual(isNaN(actual), true)
    },
    'it should not be equal to itself': (then) => (err, actual) => {
      then.ifError(err)
      then.notEqual(actual, actual)
    }
  }
})
