module.exports = (describe, dependencies) => {
  const { defaultConfig } = dependencies
  const expectedContext = {
    context: {
      foo: 'bar'
    }
  }

  return describe('assertion output', {
    'when an assertion passes, and returns an object with a `context` property': {
      when: async () => {
        const sut = describe.Suite({ ...defaultConfig, ...{ name: 'context-output-1' } })
        const expectedBehavior = 'returns-context'
        await sut(expectedBehavior, (t) => expectedContext)
        return { events: sut.config.reporters[0].events, expectedBehavior }
      },
      'it should include the context in the event': (t) => (err, actual) => {
        t.ifError(err)
        const found = actual.events.filter((event) => event.behavior === actual.expectedBehavior)
        t.strictEqual(found[1].type, 'TEST')
        t.strictEqual(found[1].status, 'PASSED')
        t.strictEqual(found[1].context, expectedContext.context)
      }
    },
    'when an assertion passes, and returns a Promise with a `context` property': {
      when: async () => {
        const sut = describe.Suite({ ...defaultConfig, ...{ name: 'context-output-2' } })
        const expectedBehavior = 'returns-context'
        await sut(expectedBehavior, (t) => Promise.resolve(expectedContext))
        return { events: sut.config.reporters[0].events, expectedBehavior }
      },
      'it should include the context in the event': (t) => (err, actual) => {
        t.ifError(err)
        const found = actual.events.filter((event) => event.behavior === actual.expectedBehavior)
        t.strictEqual(found[1].type, 'TEST')
        t.strictEqual(found[1].status, 'PASSED')
        t.strictEqual(found[1].context, expectedContext.context)
      }
    }
  })
}
