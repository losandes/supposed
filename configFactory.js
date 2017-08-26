'use strict'
module.exports = {
  makeSuiteConfig: makeSuiteConfig
}

function makeSuiteConfig (defaults, overrides, reporterFactory) {
  var suiteConfig

  overrides = Object.assign({}, overrides)

  suiteConfig = {
    timeout: overrides.timeout || 2000,
    assertionLibrary: overrides.assertionLibrary || defaults.assertionLibrary,
    reporter: overrides.reporter || defaults.reporter
  }

  if (typeof suiteConfig.reporter === 'string') {
    // allow overrides to add their own reporter
    // if the reporter is a string, get it from the reporterFactory
    suiteConfig.reporter = reporterFactory.get(suiteConfig.reporter)
  }

  function makeTheoryConfig (theory) {
    theory = Object.assign({}, theory)

    return {
      timeout: theory.timeout || suiteConfig.timeout,
      assertionLibrary: theory.assertionLibrary || suiteConfig.assertionLibrary,
      reporter: suiteConfig.reporter
    }
  }

  return {
    reporter: suiteConfig.reporter,
    makeTheoryConfig: makeTheoryConfig
  }
}
