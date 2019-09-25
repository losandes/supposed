'use strict'
module.exports = {
  name: 'configFactory',
  factory: {
    makeSuiteConfig: makeSuiteConfig
  }
}

function makeSuiteConfig (defaults, overrides, reporterFactory) {
  var suiteConfig = {
    timeout: 2000,
    assertionLibrary: defaults.assertionLibrary,
    reporterName: defaults.reporter,
    reporter: defaults.reporter,
    match: defaults.match
  }
  overrides = { ...overrides }

  ;[
    'reporter',
    'match',
    'timeout',
    'assertionLibrary'
  ].forEach((key) => {
    if (overrides[key]) {
      suiteConfig[key] = overrides[key]
    }
  })

  if (typeof suiteConfig.reporter === 'string') {
    // allow overrides to add their own reporter
    // if the reporter is a string, get it from the reporterFactory
    suiteConfig.reporterName = suiteConfig.reporter
    suiteConfig.reporter = reporterFactory.get(suiteConfig.reporter)
  } else if (overrides.reporter) {
    // the reporter must be a function that was passed in
    suiteConfig.reporterName = suiteConfig.reporter.name || 'CUSTOM'
  }

  suiteConfig.makeTheoryConfig = (theory) => {
    theory = { ...theory }

    return {
      timeout: theory.timeout || suiteConfig.timeout,
      assertionLibrary: theory.assertionLibrary || suiteConfig.assertionLibrary,
      reporter: suiteConfig.reporter
    }
  }

  return suiteConfig
}
