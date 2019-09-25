;(function (root) {
  function throwError (actual, expected, message, userMessage) {
    const _message = userMessage ? ': ' + userMessage : ''
    const err = new Error(message + _message)
    err.expected = expected
    err.actual = actual

    throw err
  }

  function makeMessage (actual, expected, condition) {
    return 'Expected ' + actual + ' to ' + condition + ' ' + expected
  }

  root.browserTestAssert = {
    ifError: function (err, message) {
      if (err) {
        throwError(err, null, 'Unexpected error occurred', message)
      }
    },
    strictEqual: function (actual, expected, message) {
      if (actual !== expected) {
        throwError(actual, expected, makeMessage(actual, expected, '==='), message)
      }
    },
    notEqual: function (actual, expected, message) {
      if (actual === expected) {
        throwError(actual, expected, makeMessage(actual, expected, '!=='), message)
      }
    }
  }
})(window)
