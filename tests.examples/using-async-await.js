const test = require('supposed')

test('when dividing a number by zero', {
  given: async () => {
    const given = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(42)
      }, 0)
    })

    return given
  },
  when: async (number) => {
    const actual = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(number / 0)
      }, 0)
    })

    return actual
  },
  'it should return Infinity': (then) => async (err, actual) => {
    then.ifError(err)
    then.strictEqual(actual, Infinity)
  }
})

test('divide by zero equals infinity', async (t) => {
  const actual = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(42 / 0)
    }, 0)
  })

  t.strictEqual(actual, Infinity)
})
