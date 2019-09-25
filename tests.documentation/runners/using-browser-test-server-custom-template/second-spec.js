// ./second-module/second-spec.js
/* eslint-disable */
(function (root) {
  // eslint-disable-line no-extra-semi
  'use strict';

  root.secondSpec = (test) => test('given second-spec, when...', {
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
})(window)
