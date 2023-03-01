module.exports = function (test) {
  return test('assertion styles', {
    'when the assertions don\'t curry': {
      when: () => 42,
      'it should support one big func': (t, err, actual) => {
        t.ifError(err)
        t.strictEqual(actual, 42)
      },
    },
    'when the assertions curry': {
      when: () => 42,
      'it should support currying': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual, 42)
      },
    },
    'when the assertions ignore the results of when': {
      'it should support just accepting the assertion library': (t) => {
        t.strictEqual(1, 1)
      },
    },
  }) // /describe
}
