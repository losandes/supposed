module.exports = function (test, dependencies) {
  const { chai, defaultConfig } = dependencies

  return test('Suite', {
    'when a new suite is created with a timeout': {
      when: () => {
        const sut = test.Suite({ ...defaultConfig, ...{ timeout: 5 } })

        return sut('sut', {
          'sut-description': {
            when: () => { return new Promise(() => { /* should timeout */ }) },
            'sut-assertion': t => {
              t.fail('it should not get here')
            },
          },
        })
      },
      'it should use the configured timeout': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.broken, 1)
        t.strictEqual(actual.results[0].error.message, 'Timeout: the test exceeded 5 ms')
      },
    },
    'when a new suite is created with an assertion library': {
      when: () => {
        const sut = test.Suite({ ...defaultConfig, ...{ assertionLibrary: chai.expect } })
        return sut('sut', {
          'sut-description': {
            when: () => { return 42 },
            'sut-assertion': (expect) => (err, actual) => {
              expect(err).to.equal(null)
              expect(actual).to.equal(42)
            },
          },
        })
      },
      'it should use the configured assertion library': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.passed, 1)
      },
    },
    'when a new suite is created with a reporter name': {
      when: async () => {
        const expectedBehavior = 'legacy-reporter'
        const sut = test.Suite(defaultConfig)

        await sut(expectedBehavior, (t) => { t.strictEqual(1, 1) })
        return { events: sut.config.reporters[0].events, expectedBehavior }
      },
      'it should use the configured reporter': (t) => (err, actual) => {
        t.ifError(err)
        const found = actual.events.filter((event) => event.behavior === actual.expectedBehavior)
        t.strictEqual(found[1].type, 'TEST')
      },
      // SOMEDAY - this test would cause confusing output for this suite
      '# TODO and the reporter is unknown': {
        'it should use the default reporter': (t) => {},
      },
    },
    'when a new suite is created with multiple reporters': {
      when: async () => {
        const expectedBehavior = 'legacy-reporter'
        const sut = test.Suite({ ...defaultConfig, ...{ reporter: null, reporters: ['ARRAY', 'QUIET'] } })

        await sut(expectedBehavior, (t) => { t.strictEqual(1, 1) })
        return {
          events1: sut.config.reporters[0].events,
          events2: sut.config.reporters[1].events,
          expectedBehavior,
        }
      },
      'it should use all configured reporters': (t) => (err, actual) => {
        t.ifError(err)
        const found1 = actual.events1.filter((event) => event.behavior === actual.expectedBehavior)
        const found2 = actual.events1.filter((event) => event.behavior === actual.expectedBehavior)

        t.strictEqual(found1[1].type, 'TEST')
        t.strictEqual(found2[1].type, 'TEST')
      },
    },
    'when a new suite is created with a reporter (legacy: `{ report (event: ITestEvent): Promise<void> }`)': {
      when: async () => {
        const events = []
        const expectedBehavior = 'legacy-reporter'
        const sut = test.Suite({
          ...defaultConfig,
          ...{
            reporter: {
              report: (event) => events.push(event),
            },
          },
        })

        await sut(expectedBehavior, (t) => { t.strictEqual(1, 1) })
        return { events, expectedBehavior }
      },
      'it should use the configured reporter': (t) => (err, actual) => {
        t.ifError(err)
        const found = actual.events.filter((event) => event.behavior === actual.expectedBehavior)
        t.strictEqual(found[1].type, 'TEST')
      },
    },
    'when a new suite is created with a reporter (`{ write (event: ITestEvent): Promise<void> }`)': {
      when: async () => {
        const events = []
        const expectedBehavior = 'legacy-reporter'
        const sut = test.Suite({
          ...defaultConfig,
          ...{
            reporter: {
              write: (event) => events.push(event),
            },
          },
        })

        await sut(expectedBehavior, (t) => { t.strictEqual(1, 1) })
        return { events, expectedBehavior }
      },
      'it should use the configured reporter': (t) => (err, actual) => {
        t.ifError(err)
        const found = actual.events.filter((event) => event.behavior === actual.expectedBehavior)
        t.strictEqual(found[1].type, 'TEST')
      },
    },
    'when a new suite is created with a reporter (`(event: ITestEvent): Promise<void>`)': {
      when: async () => {
        const events = []
        const expectedBehavior = 'legacy-reporter'
        const sut = test.Suite({
          ...defaultConfig,
          ...{
            reporter: (event) => events.push(event),
          },
        })

        await sut(expectedBehavior, (t) => { t.strictEqual(1, 1) })
        return { events, expectedBehavior }
      },
      'it should use the configured reporter': (t) => (err, actual) => {
        t.ifError(err)
        const found = actual.events.filter((event) => event.behavior === actual.expectedBehavior)
        t.strictEqual(found[1].type, 'TEST')
      },
    },
    'when a new suite is created with given and when synonyms': {
      when: () => {
        const sut = test.Suite({
          ...defaultConfig,
          ...{
            givenSynonyms: ['before', 'setup'],
            whenSynonyms: ['execute', 'run'],
          },
        })

        return sut('sut', {
          'sut-description': {
            before: () => 42,
            execute: (given) => { return given / 0 },
            'sut-assertion': (t) => (err, actual) => {
              t.ifError(err)
              t.strictEqual(actual, Infinity)

              return { log: { actual } }
            },
            'nest-description': {
              setup: () => 42,
              run: (given) => { return given / 0 },
              'sut-assertion': (t) => (err, actual) => {
                t.ifError(err)
                t.strictEqual(actual, Infinity)

                return { log: { actual } }
              },
            },
          },
          'side-description': {
            setup: () => 42,
            run: (given) => { return given / 0 },
            'sut-assertion': (t) => (err, actual) => {
              t.ifError(err)
              t.strictEqual(actual, Infinity)

              return { log: { actual } }
            },
          },
        })
      },
      'it should use the configured synonyms': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.passed, 3)
        t.strictEqual(actual.results[0].log.actual, Infinity)
        t.strictEqual(actual.results[1].log.actual, Infinity)
        t.strictEqual(actual.results[2].log.actual, Infinity)
      },
      'and the synonyms include empty strings': {
        when: () => {
          const sut = test.Suite({
            ...defaultConfig,
            ...{
              givenSynonyms: [''],
              whenSynonyms: ['  '],
            },
          })

          return sut
        },
        'it should throw': (t) => (err, actual) => {
          t.strictEqual(err.message, 'Invalid givenSynonym: expected {string} to be a non-empty {string}, Invalid whenSynonym: expected {string} to be a non-empty {string}')
        },
      },
      'and the synonyms include non-strings': {
        when: () => {
          const sut = test.Suite({
            ...defaultConfig,
            ...{
              givenSynonyms: [42],
              whenSynonyms: [() => {}],
            },
          })

          return sut
        },
        'it should throw': (t) => (err, actual) => {
          t.strictEqual(err.message, 'Invalid givenSynonym: expected {number} to be a non-empty {string}, Invalid whenSynonym: expected {function} to be a non-empty {string}')
        },
      },
    },
    'test out how "quoted fields" work': () => {},
  })
}
