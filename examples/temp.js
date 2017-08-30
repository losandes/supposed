const describe = require('../index.js')
// const sut = describe.Suite({ reporter: 'QUIET', timeout: 10 })
var givenRan = false

// [ { behavior: 'assay, when a given exists without a when',
// given: undefined,
// when: [Function: when],
// assertions:
//  [ { behavior: 'assay, when a given exists without a when, it should run the tests',
//      test: [Function: it should run the tests],
//      skipped: false } ],
// skipped: false } ]

// [ { behavior: 'assay, when a given exists without a when',
// given: undefined,
// when: [Function: when],
// assertions:
//  [ { behavior: 'assay, when a given exists without a when, it should run the tests',
//      test: [Function: it should run the tests],
//      skipped: false } ],
// skipped: false },
// { behavior: null,
// given: undefined,
// when: [Function: when],
// assertions: [],
// skipped: false } ]

describe('assay', {
  'when a given exists without a when': {
    given: (resolve, reject) => {
console.log('HERE')
      setTimeout(() => {
        givenRan = true
        resolve()
      }, 0)
    },
    when: (resolve, reject) => (given) => {
      resolve(given)
    },
    'it should run the tests': (t, err, actual) => {
      t.ifError(err)
      t.equal(givenRan, true)
    }
  }
})

// given: (resolve) => { resolve(42) },

// describe('assay', {
//   'when a given, a when, and thens exist': {
// //     given: (resolve, reject) => {
// //       setTimeout(() => { resolve(42) }, 0)
// //     },
// //     when: (resolve, reject) => (given) => {
// // debugger
// //       setTimeout(() => { resolve(given) }, 0)
// //     },
//     when: (resolve) => { resolve(42) },
//     'it should run the tests': (t, err, actual) => {
//       t.ifError(err)
//       t.equal(actual, 42)
//     }
//   }
//   // 'when a given, a when, and thens exist': {
//   //   given: (resolve, reject) => {
//   //     setTimeout(() => { resolve(42) }, 0)
//   //   },
//   //   w
//   //   'it should run the tests': (t, err, actual) => {
//   //     t.ifError(err)
//   //     t.equal(actual, 42)
//   //   }
//   // }
//   // 'when the `given` throws an error': {
//   //   given: () => { throw new Error('GIVEN!') },
//   //   when: (given) => (resolve) => { resolve(given) },
//   //   'it should pass the error to the assertions': (t, err) => {
//   //     t.fail('it should not get here')
//   //   }
//   // },
//   // 'when a given, a when, and thens exist': {
//   //   given: (resolve, reject) => {
//   //     setTimeout(() => { resolve(42) }, 0)
//   //   },
//   //   when: (given) => (resolve, reject) => {
//   //     setTimeout(() => { resolve(given) }, 0)
//   //   },
//   //   'it should run the tests': (t, err, actual) => {
//   //     t.ifError(err)
//   //     t.equal(actual, 42)
//   //   }
//   // }
//   // 'when `when` is never resolved real': {
//   //   when: (resolve) => { resolve(42) },
//   //   'it should throw a timeout exception': (t, err, actual) => {
//   //     t.equal(actual, 41)
//   //   }
//   // }
//   // 'when `when` is never resolved real': {
//   //   when: () => {},
//   //   'it should throw a timeout exception': t => {
//   //     t.fail('it should not get here')
//   //   }
//   // }
//   // 'when the `when` is synchronous': {
//   //   when: resolve => {
//   //     resolve(41)
//   //   },
//   //   'it should not execute the assertions until the when is resolved': (t, err, actual) => {
//   //     t.equal(actual, 41)
//   //   }
//   // }
// })

// // describe('assay', {
// //   // 'when `when` is never resolved real': {
// //   //   when: () => {},
// //   //   'it should throw a timeout exception': t => {
// //   //     t.fail('it should not get here')
// //   //   }
// //   // }
// //   'when the `when` is asynchronous': {
// //     when: resolve => {
// //       setTimeout(() => { resolve(42) }, 30)
// //     },
// //     'it should not execute the assertions until the when is resolved': (t, err, actual) => {
// //       t.equal(actual, 42)
// //     }
// //   }
// // })
