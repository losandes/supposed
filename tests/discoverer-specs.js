module.exports = function (describe, dependencies) {
  const { chai, path, defaultConfig } = dependencies

  return describe('DefaultDiscoverer', {
    'when a runner is configured to match a different working directory': {
      when: () => {
        const sut = describe.Suite(defaultConfig)
        const runner = sut.runner({
          cwd: path.join(process.cwd(), '/tests/discoverer-meta-specs'),
          matchesNamingConvention: /.\/namingspec\.js$/i,
          matchesIgnoredConvention: /^ignore$/i
        })

        return runner.run()
      },
      'it should find and run those tests': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.suite.getTotals().passed, 1)
        t.strictEqual(actual.files.length, 1)
        t.strictEqual(actual.files[0].indexOf('namingspec.js') > -1, true)
      },
      'the config that is returned should have the overrides': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.runConfig.cwd.indexOf('tests/discoverer-meta-specs') > -1, true)
        t.deepStrictEqual(actual.runConfig.directories, ['.'])
        t.strictEqual(actual.runConfig.matchesNamingConvention.toString(), '/.\\/namingspec\\.js$/i')
        t.strictEqual(actual.runConfig.matchesIgnoredConvention.toString(), '/^ignore$/i')
      }
    },
    'when a runner is configured to match a different naming convention, using a regular expression': {
      when: () => {
        const sut = describe.Suite(defaultConfig)
        const runner = sut.runner({
          directories: ['./tests/discoverer-meta-specs'],
          matchesNamingConvention: /.\/namingspec\.js$/i,
          matchesIgnoredConvention: /^ignore$/i
        })

        return runner.run()
      },
      'it should find and run those tests': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.suite.getTotals().passed, 1)
        t.strictEqual(actual.files.length, 1)
        t.strictEqual(actual.files[0].indexOf('namingspec.js') > -1, true)
      },
      'the config that is returned should have the overrides': (t) => (err, actual) => {
        t.ifError(err)
        t.deepStrictEqual(actual.runConfig.directories, ['./tests/discoverer-meta-specs'])
        t.strictEqual(actual.runConfig.matchesNamingConvention.toString(), '/.\\/namingspec\\.js$/i')
        t.strictEqual(actual.runConfig.matchesIgnoredConvention.toString(), '/^ignore$/i')
      }
    },
    'when a runner is configured to match a different naming convention, using a test function': {
      when: () => {
        const sut = describe.Suite(defaultConfig)
        const runner = sut.runner({
          directories: ['./tests/discoverer-meta-specs'],
          matchesNamingConvention: {
            test: (input) => {
              return input.indexOf('namingspec.js') > -1
            }
          }
        })

        return runner.run()
      },
      'it should find and run those tests': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.suite.getTotals().passed, 1)
        t.strictEqual(actual.files.length, 1)
        t.strictEqual(actual.files[0].indexOf('namingspec.js') > -1, true)
      }
    },
    'it should inject the suite that is being run': {
      when: () => {
        const sut = describe.Suite({ ...defaultConfig, ...{ assertionLibrary: chai.expect } })
        const runner = sut.runner({
          directories: ['./tests/discoverer-meta-specs'],
          matchesNamingConvention: /.\/injectionspec\.js$/i
        })

        return runner.run()
      },
      '': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.suite.getTotals().passed, 1)
        t.strictEqual(actual.files.length, 1)
        t.strictEqual(actual.files[0].indexOf('injectionspec.js') > -1, true)
      }
    },
    'when a runner is configured to ignore a directory, using a regular expression': {
      when: () => {
        const sut = describe.Suite(defaultConfig)
        const runner = sut.runner({
          directories: ['./tests/discoverer-meta-specs'],
          matchesNamingConvention: /.\/ignorespec\.js$/i,
          matchesIgnoredConvention: /^ignore$/i
        })

        return runner.run()
      },
      'it should not find tests that directory': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.suite.getTotals().passed, 1)
        t.strictEqual(actual.files.length, 1)
        t.strictEqual(actual.files[0].indexOf('ignorespec.js') > -1, true)
      }
    },
    'when a runner is configured to ignore a directory, using a test function': {
      when: () => {
        const sut = describe.Suite(defaultConfig)
        const runner = sut.runner({
          directories: ['./tests/discoverer-meta-specs'],
          matchesNamingConvention: /.\/ignorespec\.js$/i,
          matchesIgnoredConvention: {
            test: (input) => {
              return input.substring(input.indexOf('ignore')) === 'ignore'
            }
          }
        })

        return runner.run()
      },
      'it should not find tests that directory': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.suite.getTotals().passed, 1)
        t.strictEqual(actual.files.length, 1)
        t.strictEqual(actual.files[0].indexOf('ignorespec.js') > -1, true)
      }
    },
    'when a runner is configured to ignore a file path': {
      when: () => {
        const sut = describe.Suite(defaultConfig)
        const runner = sut.runner({
          directories: ['./tests/discoverer-meta-specs'],
          matchesNamingConvention: /.\/ignorespec\.js$/i,
          matchesIgnoredConvention: /.\/other-ignorespec\.js$/i
        })

        return runner.run()
      },
      'it should not find tests that directory': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.suite.getTotals().passed, 2)
        t.strictEqual(actual.files.length, 2)
        t.strictEqual(actual.files[0].indexOf('ignorespec.js') > -1, true)
        t.strictEqual(actual.files[1].indexOf('ignorespec.js') > -1, true)
      }
    },
    'when the runner executes a test that doesn\'t support injection': {
      when: () => {
        const sut = describe.Suite(defaultConfig)
        const runner = sut.runner({
          directories: ['./tests/discoverer-meta-specs'],
          matchesNamingConvention: /.\/no-injectionspec\.js$/i
        })

        return runner.run()
      },
      'it should execute those files, but will not be able to report findings correctly': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.suite.getTotals().passed, 0)
        t.strictEqual(actual.files.length, 1)
        t.strictEqual(actual.files[0].indexOf('no-injectionspec.js') > -1, true)
      }
    },
    'when the runner executes a test that doesn\'t return a promise': {
      when: () => {
        const sut = describe.Suite(defaultConfig)
        const runner = sut.runner({
          directories: ['./tests/discoverer-meta-specs'],
          matchesNamingConvention: /.\/no-promisespec\.js$/i
        })

        return runner.run()
      },
      'it should execute those files, but will not be able to report findings correctly': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.suite.getTotals().passed, 0)
        t.strictEqual(actual.files.length, 1)
        t.strictEqual(actual.files[0].indexOf('no-promisespec.js') > -1, true)
      }
    },
    'it should walk the tree': {
      when: () => {
        const sut = describe.Suite(defaultConfig)
        const runner = sut.runner({
          directories: ['./tests/discoverer-meta-specs'],
          matchesNamingConvention: /.\/nestspec\.js$/i
        })

        return runner.run()
      },
      'and find specs in any folder within the working directory, and the directories': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.suite.getTotals().passed, 3)
        t.strictEqual(actual.files.length, 3)
        actual.files.forEach((file) => {
          t.strictEqual(file.indexOf('nestspec.js') > -1, true)
        })
      }
    }
  })
}
