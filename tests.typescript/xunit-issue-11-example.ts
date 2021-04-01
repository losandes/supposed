import test from 'supposed';

test('when dividing a number by zero, it should return Infinity', (t) => {
// ^--- 'test' only refers to a type, but is being used as a value here.ts(2693)
  t.strictEqual(42 / 0, Infinity);
});
