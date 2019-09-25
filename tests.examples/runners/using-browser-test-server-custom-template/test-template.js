/* eslint-disable */
(function (root) {
  'use strict';

  root.supposed
    .Suite({
      reporter: 'event'
    })
    .runner()
    .runTests([
      root.firstSpec,
      root.secondSpec
    ])
})(window);
