module.exports = {
  name: 'resolveTests',
  factory: () => {
    'use strict'

    const resolveTests = (suite) => (context) => {
      const { paths } = context

      if (!paths) {
        throw new Error('resolve-tests expects paths to the tests to be provided')
      }

      return {
        ...context,
        ...{
          tests: paths.map((path) => {
            return { path, test: require(path) }
          })
        }
      }
    }

    return { resolveTests }
  } // /factory
} // /module
