const test = require('supposed')

test('when dividing a number by zero', {
  given: () => new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(42)
    }, 0)
  }),
  when: (number) => new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(number / 0)
    }, 0)
  }),
  'it should return Infinity': (then) => (err, actual) => new Promise((resolve, reject) => {
    then.ifError(err)
    then.strictEqual(actual, Infinity)
    resolve()
  })
})

test('divide by zero equals infinity', (t) => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(42 / 0)
  }, 0)
}).then((actual) => {
  t.strictEqual(actual, Infinity)
}))
