import divideBy0 from './divide-by-0.mjs'

export default function (test) {
  return test('es modules', {
    'when the spec and modules are es modules': {
      when: divideBy0(42),
      'it should work with imports and exports': (t, err, actual) => {
        t.ifError(err)
        t.strictEqual(actual, Infinity)
      }
    }
  })
}
