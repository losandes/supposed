module.exports = (describe) => {
  const expectedLog = {
    log: {
      foo: 'bar'
    }
  }

  return describe('assertion output', {
    'when an assertion passes, and returns an object with a `log` property': {
      when: async () => {
        const sut = describe.Suite({ reporter: 'ARRAY', match: null })
        const expectedBehavior = 'returns-log'
        await sut(expectedBehavior, (t) => expectedLog)
        return { events: sut.config.reporters[0].events, expectedBehavior }
      },
      'it should include the log in the event': (t) => (err, actual) => {
        t.ifError(err)
        const found = actual.events.filter((event) => event.behavior === actual.expectedBehavior)
        t.strictEqual(found[1].type, 'TEST')
        t.strictEqual(found[1].status, 'PASSED')
        t.strictEqual(found[1].log, expectedLog.log)
      }
    },
    'when an assertion passes, and returns a Promise with a `log` property': {
      when: async () => {
        const sut = describe.Suite({ reporter: 'ARRAY', match: null })
        const expectedBehavior = 'returns-log'
        await sut(expectedBehavior, (t) => Promise.resolve(expectedLog))
        return { events: sut.config.reporters[0].events, expectedBehavior }
      },
      'it should include the log in the event': (t) => (err, actual) => {
        t.ifError(err)
        const found = actual.events.filter((event) => event.behavior === actual.expectedBehavior)
        t.strictEqual(found[1].type, 'TEST')
        t.strictEqual(found[1].status, 'PASSED')
        t.strictEqual(found[1].log, expectedLog.log)
      }
    }
  })
}
