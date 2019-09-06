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
    set: function set(val) {
      tests.push(val);
    },
    // this property should show up when this object's property names are enumerated
    enumerable: true,
    // this property may not be deleted
    configurable: false
  });

  // {{TEST_MODULES}}
console.log(window.supposed)
  var suite = window.supposed.Suite(/*{{suiteConfig}}*/);

  tests
    .map(function (test) {
      return test(suite);
    })
    .reduce(function (tasks, currentTask) {
      return tasks.then(function (results) {
        return currentTask.then(function (currentResult) {
          return [].concat(results, [currentResult]);
        });
      });
    }, Promise.resolve([])).then(function () {
      console.log(suite.getTotals())
    });
})(window);
