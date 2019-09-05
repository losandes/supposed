module.exports = function (test, dependencies) {
  const { chai } = dependencies

  return test('Suite', {
    'when a new suite is created with a timeout': {
      when: () => {
        const sut = test.Suite({ reporter: 'QUIET', timeout: 5, match: null })

        return sut('sut', {
          'sut-description': {
            when: () => { return new Promise(() => { /* should timeout */ }) },
            'sut-assertion': t => {
              t.fail('it should not get here')
            }
          }
        })
      },
      'it should use the configured timeout': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.broken, 1)
        t.strictEqual(actual.results[0].error.message, 'Timeout: the test exceeded 5 ms')
      }
    },
    'when a new suite is created with an assertion library': {
      when: () => {
        const sut = test.Suite({ reporter: 'QUIET', assertionLibrary: chai.expect, match: null })
        return sut('sut', {
          'sut-description': {
            when: () => { return 42 },
            'sut-assertion': (expect) => (err, actual) => {
              expect(err).to.equal(null)
              expect(actual).to.equal(42)
            }
          }
        })
      },
      'it should use the configured assertion library': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.passed, 1)
      }
    },
    'when a new suite is created with a reporter name': {
      when: async () => {
        const expectedBehavior = 'legacy-reporter'

        const sut = test.Suite({
          match: null,
          reporter: 'ARRAY'
        })

        await sut(expectedBehavior, (t) => { t.strictEqual(1, 1) })
        return { events: sut.reporters[0].events, expectedBehavior }
      },
      'it should use the configured reporter': (t) => (err, actual) => {
        t.ifError(err)
        const found = actual.events.find((event) => event.behavior === actual.expectedBehavior)
        t.strictEqual(found.type, 'TEST')
      },
      // SOMEDAY - this test would cause confusing output for this suite
      '# TODO and the reporter is unknown, it should use the default reporter': (t) => {}
    },
    'when a new suite is created with multiple reporters': {
      when: async () => {
        const expectedBehavior = 'legacy-reporter'

        const sut = test.Suite({
          match: null,
          reporters: ['ARRAY', 'QUIET']
        })

        await sut(expectedBehavior, (t) => { t.strictEqual(1, 1) })
        return {
          events1: sut.reporters[0].events,
          events2: sut.reporters[1].events,
          expectedBehavior
        }
      },
      'it should use all configured reporters': (t) => (err, actual) => {
        t.ifError(err)
        const found1 = actual.events1.find((event) => event.behavior === actual.expectedBehavior)
        const found2 = actual.events1.find((event) => event.behavior === actual.expectedBehavior)

        t.strictEqual(found1.type, 'TEST')
        t.strictEqual(found2.type, 'TEST')
      }
    },
    'when a new suite is created with a reporter (legacy: `{ report (event: ITestEvent): Promise<void> }`)': {
      when: async () => {
        const events = []
        const expectedBehavior = 'legacy-reporter'

        const sut = test.Suite({
          match: null,
          reporter: {
            report: (event) => events.push(event)
          }
        })

        await sut(expectedBehavior, (t) => { t.strictEqual(1, 1) })
        return { events, expectedBehavior }
      },
      'it should use the configured reporter': (t) => (err, actual) => {
        t.ifError(err)
        const found = actual.events.find((event) => event.behavior === actual.expectedBehavior)
        t.strictEqual(found.type, 'TEST')
      }
    },
    'when a new suite is created with a reporter (`{ write (event: ITestEvent): Promise<void> }`)': {
      when: async () => {
        const events = []
        const expectedBehavior = 'legacy-reporter'

        const sut = test.Suite({
          match: null,
          reporter: {
            write: (event) => events.push(event)
          }
        })

        await sut(expectedBehavior, (t) => { t.strictEqual(1, 1) })
        return { events, expectedBehavior }
      },
      'it should use the configured reporter': (t) => (err, actual) => {
        t.ifError(err)
        const found = actual.events.find((event) => event.behavior === actual.expectedBehavior)
        t.strictEqual(found.type, 'TEST')
      }
    },
    'when a new suite is created with a reporter (`(event: ITestEvent): Promise<void>`)': {
      when: async () => {
        const events = []
        const expectedBehavior = 'legacy-reporter'

        const sut = test.Suite({
          match: null,
          reporter: (event) => events.push(event)
        })

        await sut(expectedBehavior, (t) => { t.strictEqual(1, 1) })
        return { events, expectedBehavior }
      },
      'it should use the configured reporter': (t) => (err, actual) => {
        t.ifError(err)
        const found = actual.events.find((event) => event.behavior === actual.expectedBehavior)
        t.strictEqual(found.type, 'TEST')
      }
    }
  })
}
