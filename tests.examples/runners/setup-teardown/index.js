const { expect } = require('chai')
const supposed = require('supposed')
const db = []
const testIds = []
const someRepo = {
  get: async (id) => db.find((record) => record.id === id),
  set: async (record) => db.push(record),
  remove: async (id) => db.splice(db.findIndex((record) => record.id === id), 1)
}

const setup = async () => {
  await someRepo.set({ id: 1, foo: 'bar' })
  await someRepo.set({ id: 2, foo: 'baz' })

  testIds.push(1)
  testIds.push(2)
}

const teardown = async () => {
  await testIds.forEach(async (id) => someRepo.remove(id))
}

setup()
  .then(() => supposed
    .Suite({
      name: 'supposed-docs.setup-and-teardown',
      assertionLibrary: expect,
      inject: { someRepo }
    })
    .subscribe((event) => {
      if (event.type === 'TEST' && event.context && event.context.testIds) {
        // track the data we inserted, so we can remove it at the end
        event.context.testIds.forEach((id) => testIds.push(id))
      }
    })
    .runner({ cwd: __dirname })
    .run()
  )
  .then(async () => {
    try {
      await teardown()
      expect(db).to.deep.equal([])
      console.log('Teardown succeeded!')
    } catch (e) {
      console.log('Teardown failed!', e)
    }
  })
  .catch((e) => {
    console.log(e)
  })
