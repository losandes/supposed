const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET' })

describe('assay', {
  'when descriptions are deeply nested': {
    when: descriptionsAreDeeplyNested,
    'it should run them all': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 3)
    }
  },
  'when nested assertions have no when': {
    'and a parent description does have a when': {
      when: nestsInheritWhens,
      'it should use the parent when': (t, err, actual) => {
        t.ifError(err)
        t.equal(actual.totals.passed, 2)
      }
    }
  },
  'when the `when` is asynchronous': {
    when: whenIsAsync,
    'it should not execute the assertions until the when is resolved': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 1)
    }
  }
}) // /describe

function descriptionsAreDeeplyNested (resolve) {
  sut({
    'when we keep nesting (1)': {
      'and nesting (2)': {
        when: resolve => { resolve(42 / 0) },
        'it should support branching the rabbit hole': (t, err, actual) => {
          t.equal(actual, Infinity)
        },
        'and nesting (3)': {
          'and nesting (4)': {
            when: resolve => { resolve(42 / 0) },
            'it should follow the rabbit hole': (t, err, actual) => {
              t.equal(actual, Infinity)
            },
            'and nesting (5)': {
              'and nesting (6)': {
                when: resolve => { resolve(42 / 0) },
                'it should follow the rabbit hole': (t, err, actual) => {
                  t.equal(actual, Infinity)
                }
              }
            }
          }
        }
      }
    }
  }).then(resolve)
}

function nestsInheritWhens (resolve) {
  sut({
    'when we keep nesting (1)': {
      'and nesting (2)': {
        when: resolve => { resolve(42 / 0) },
        'it should support branching the rabbit hole': (t, err, actual) => {
          t.equal(actual, Infinity)
        },
        'and nesting (3)': {
          'and nesting (4)': {
            'it should follow the rabbit hole': (t, err, actual) => {
              t.equal(actual, Infinity)
            }
          }
        }
      }
    }
  }).then(resolve)
}

function whenIsAsync (resolve) {
  sut({
    'when the `when` is asynchronous': {
      when: resolve => {
        setTimeout(() => { resolve(42) }, 10)
      },
      'it should not execute the assertions until the when is resolved': (t, err, actual) => {
        t.equal(actual, 42)
      }
    }
  }).then(resolve)
}
