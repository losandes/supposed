module.exports = {
  name: 'resolveTests',
  factory: () => {
    'use strict'

    const resolveTests = () => (context) => {
      const { paths } = context

      if (!paths) {
        throw new Error('resolve-tests expects paths to the tests to be provided')
      }

      return {
        ...context,
        ...{
          tests: paths.map((path) => {
            try {
              return { path, test: require(path) }
            } catch (e) {
              e.filePath = path
              return { path, err: e }
            }
          })
        }
      }
    }

    return { resolveTests }
  } // /factory
} // /module
