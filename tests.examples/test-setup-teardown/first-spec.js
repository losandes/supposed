// ./first-module/first-spec.js
module.exports = (test) => {
  const db = []

  return test('if you want to setup and teardown for test(s)', {
    'you can do the work with the existing DSLs': {
      given: async () => {
        // setup
        db.push({ id: 1, name: 'Jane' })
      },
      when: async () => {
        const byId = (record) => record.id === 1
        const actual = db.find(byId)

        // teardown
        db.splice(db.findIndex(byId), 1)

        return actual
      },
      'it should have inserted, and removed records':
        (t) => (err, actual) => {
          t.strictEqual(err, null)
          t.strictEqual(actual.id, 1)
          t.strictEqual(db.find((record) => record.id === 1), undefined)
        }
    },
    'or you can define your own DSL so it makes more sense to you': {
      setup: async () => {
        db.push({ id: 1, name: 'Jane' })
        const actual = db.find((record) => record.id === 1)

        return actual
      },
      teardown: async (actual) => {
        db.splice(db.findIndex((record) => record.id === 1), 1)

        return actual
      },
      'it should have inserted, and removed records':
        (t) => (err, actual) => {
          t.strictEqual(err, null)
          t.strictEqual(actual.id, 1)
          t.strictEqual(db.find((record) => record.id === 1), undefined)
        }
    }
  })
}
