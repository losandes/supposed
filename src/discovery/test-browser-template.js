/* eslint-disable */
(function (root) {
  // eslint-disable-line no-extra-semi
  'use strict';

  var tests = []

  var module = {};
  Object.defineProperty(module, 'exports', {
    get: function get() {
      return null;
    },
    set: function set(test) {
      tests.push({ path: '.', test: test });
    },
    // this property should show up when this object's property names are enumerated
    enumerable: true,
    // this property may not be deleted
    configurable: false
  });

  // {{TEST_MODULES}}

  window.supposed
    .Suite(/*{{suiteConfig}}*/)
    .runner({ tests, injectSuite: true })
    .runTests()
})(window);
