module.exports = (test) => {
  return test('skip and failure modes', {
    'when the assertion is not met': {
      'it should fail': (then) => {
        then.strictEqual('"actual"', { foo: { bar: 42 } })
      },
      'it should fail (numbers)': (then) => {
        then.strictEqual(1, 2)
      },
      'it should fail (bool)': (then) => {
        then.strictEqual(true, false)
      },
      'it should fail (strings)': (then) => {
        then.strictEqual('true', 'false')
      },
      'it should fail (func)': (then) => {
        then.strictEqual('true', () => 'false')
      },
    },
    'when given throws, it should report as BROKEN': {
      given: () => { throw new Error('Given BOOM!') },
      when: (number) => { return number / 0 },
      'it should report as BROKEN': (then) => (err, actual) => {
        then.ifError(err)
      },
    },
    'when when throws': {
      given: () => 42,
      when: (number) => { throw new Error('When BOOM!') },
      'it should report as FAILED': (then) => (err, actual) => {
        then.ifError(err)
      },
    },
    '// when using skip comments': {
      given: () => 42,
      when: (number) => { return number / 0 },
      'it should be skipped': (then) => (err, actual) => {
        then.ifError(err)
        then.strictEqual(actual, Infinity)
      },
    },
    '# SKIP when using TAP skip comments': {
      given: () => 42,
      when: (number) => { return number / 0 },
      'it should be skipped': (then) => (err, actual) => {
        then.ifError(err)
        then.strictEqual(actual, Infinity)
      },
    },
    '# TODO when using TAP todo comments': {
      given: () => 42,
      when: (number) => { return number / 0 },
      'it should be skipped': (then) => (err, actual) => {
        then.ifError(err)
        then.strictEqual(actual, Infinity)
      },
    },
    'when a test returns something to be logged': {
      'some reporters should display a comment': (then) => {
        return {
          log: {
            message: 'This is a comment',
            hello: 'world',
          },
        }
      },
    },
  })
}
