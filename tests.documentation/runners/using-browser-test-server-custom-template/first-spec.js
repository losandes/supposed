/* eslint-disable */
// ./first-module/first-spec.js
(function (root) {
  // eslint-disable-line no-extra-semi
  'use strict';

  root.firstSpec = (test) => test('given first-spec, when...', {
    given: () => 42,
    when: (given) => given / 0,
    'it...': () => (err, actual) => {
      if (err) {
        throw err
      }

      if (actual !== Infinity) {
        throw new Error(`Expected ${actual} === Infinity`)
      }
    }
  })
})(window);
