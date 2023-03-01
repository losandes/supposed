const test = require('../../index.js').Suite({ reporter: 'QUIET' })

test('DefaultDiscoverer', {
  injectionspec: t => {
    t.strictEqual(1, 1)
  },
})
