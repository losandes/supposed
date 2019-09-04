module.exports = {
  name: 'all-settled',
  factory: () => {
    'use strict'

    function allSettled (promises) {
      return Promise.all(promises.map((promise) => {
        return new Promise((resolve) => {
          try {
            promise.then((value) => {
              resolve({ status: 'fullfilled', value })
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
  }
}
