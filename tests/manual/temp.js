const test = require('../../index')

const insertSpec = () => test('when a user is inserted into the database', t => {
  t.ok(true)
})

const updateSpec = () => test('when that user is updated', t => {
  t.ok(true)
})

insertSpec()
  .then(updateSpec())


