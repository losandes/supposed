var describe = require('../index.js')

// describe('temp1', {
//   'when dividing a number by zero': {
//     when: resolve => { resolve(42 / 0) },
//     'we get Infinity': (t, err, actual) => {
//       t.equal(actual, Infinity)
//     }
//   }
// }).then(results => {
//   console.dir(results, { depth: null })
// })

// describe('temp2', {
//   '// when the when is skipped': {
//     when: resolve => { resolve(42 / 0) },
//     'we get Infinity': (t, err, actual) => {
//       t.equal(actual, Infinity)
//     }
//   },
//   'when dividing a number by zero': {
//     when: resolve => { resolve(42 / 0) },
//     '// when the assertion is skipped': (t, err, actual) => {
//       t.equal(actual, Infinity)
//     },
//     'we get Infinity': (t, err, actual) => {
//       t.equal(actual, Infinity)
//     }
//   }
// }).then(results => {
//   console.dir(results, { depth: null })
// })

// describe('skipping tests', {
//   'when an assertion is skipped': {
//     'and it is the only assertion for a given behavior': {
//       'it should NOT RUN the behavior': t => {
//         t.equal(1, 1)
//       },
//       'it should NOT RUN assertion': (t, err, actual) => {
//         t.equal(1, 1)
//       }
//     },
//     'and other assertions exist for this behavior': {
//       'it should RUN the behavior': (t, err, actual) => {
//         t.equal(1, 1)
//       },
//       'it should NOT RUN the assertion': (t, err, actual) => {
//         t.equal(1, 1)
//       }
//     }
//   },
//   'when a behavior is skipped': {
//     'it should NOT RUN the behavior': (t, err, actual) => {
//       t.equal(1, 1)
//     },
//     'it should NOT RUN assertion': (t, err, actual) => {
//       t.equal(1, 1)
//     }
//   }
// })
