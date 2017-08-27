const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET', timeout: 10 })

describe('assay', {
  'when `when` is never resolved real': {
    when: (resolve) => { resolve(42) },
    'it should throw a timeout exception': (t, err, actual) => {
      t.equal(actual, 41)
    }
  }
  // 'when `when` is never resolved real': {
  //   when: () => {},
  //   'it should throw a timeout exception': t => {
  //     t.fail('it should not get here')
  //   }
  // }
  // 'when the `when` is synchronous': {
  //   when: resolve => {
  //     resolve(41)
  //   },
  //   'it should not execute the assertions until the when is resolved': (t, err, actual) => {
  //     t.equal(actual, 41)
  //   }
  // }
})

// describe('assay', {
//   // 'when `when` is never resolved real': {
//   //   when: () => {},
//   //   'it should throw a timeout exception': t => {
//   //     t.fail('it should not get here')
//   //   }
//   // }
//   'when the `when` is asynchronous': {
//     when: resolve => {
//       setTimeout(() => { resolve(42) }, 30)
//     },
//     'it should not execute the assertions until the when is resolved': (t, err, actual) => {
//       t.equal(actual, 42)
//     }
//   }
// })
