module.exports = {
  name: 'makeDebugger',
  factory: () => {
    'use strict'

    const makeDebugger = (include) => {
      const INCLUDE = include || (typeof process !== 'undefined' && process.env && process.env.NODE_DEBUG)

      return {
        withSource: (source) => (...params) => {
          if (
            INCLUDE && (
              INCLUDE.split(',').indexOf('supposed') > -1 ||
              INCLUDE.split(',').indexOf(source) > -1
            )
          ) {
            console.dir(params, { depth: null })
          }

          // return the 1st input to make this pass-through/chainable
          return params && params[0]
        }
      }
    }

    return { makeDebugger }
  }
}
