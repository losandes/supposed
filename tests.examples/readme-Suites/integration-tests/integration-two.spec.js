const test = require('supposed')

test('integration-two, divide by zero equals infinity', async (t) => {
  const actual = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(42 / 0)
    }, 0)
  })

  t.strictEqual(actual, Infinity)
})
