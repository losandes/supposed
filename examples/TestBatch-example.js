'use strict'

const tests = require('./sample-tests.js')
const TestBatch = require('../src/TestBatch.js')

var batch = {
  'when dividing a number by zero': {
    when: resolve => { resolve(42 / 0) },
    'we get Infinity': (t, err, actual) => {
      t.equal(actual, Infinity)
    }
  },
  'when dividing zero by zero': {
    when: resolve => { resolve(0 / 0) },
    'we get a value which': {
      'is not a number': (t, err, actual) => {
        t.isNaN(actual)
      },
      'is not equal to itself': (t, err, actual) => {
        t.notEqual(actual, actual)
      }
    }
  }
}

console.dir(new TestBatch(tests), { depth: null })
