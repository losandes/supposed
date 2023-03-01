module.exports = {
  name: 'allSettled',
  factory: () => {
    'use strict'

    function allSettled (promises) {
      return Promise.all(promises.map((promise) => {
        return new Promise((resolve) => {
          try {
            promise.then((value) => {
              resolve({ status: 'fulfilled', value })
            }).catch((err) => {
              resolve({ status: 'rejected', reason: err })
            })
          } catch (err) {
            // most likely, we received something other than a promise in the array
            resolve({ status: 'rejected', reason: err })
          }
        })
      }))
    }

    return { allSettled }
  },
}
