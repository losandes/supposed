module.exports = {
  name: 'resolveTests',
  factory: () => {
    'use strict'

    const resolveTests = () => async (context) => {
      const { paths } = context

      if (!paths) {
        throw new Error('resolve-tests expects paths to the tests to be provided')
      }

      const tests = []

      for (const path of paths) {
        try {
          tests.push({ path, test: await import(path) })
        } catch (e) {
          e.filePath = path
          tests.push({ path, err: e })
        }
      }

      return {
        ...context,
        ...{ tests },
      }
    }

    return { resolveTests }
  }, // /factory
} // /module
