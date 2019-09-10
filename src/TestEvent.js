module.exports = {
  name: 'TestEvent',
  factory: () => {
    'use strict'

    const TYPE_EXPRESSION = /(^START$)|(^START_BATCH$)|(^TEST$)|(^INFO$)|(^END_BATCH$)|(^END_TALLY$)|(^END$)/
    const STATUS_EXPRESSION = /(^PASSED$)|(^SKIPPED$)|(^FAILED$)|(^BROKEN$)/
    let testCount = 0

    const makeJSONStringifiableError = (err) => {
      const error = {
        message: err.message,
        stack: err.stack
      }

      Object.keys(err).forEach((key) => {
        const _err = err[key]

        if (_err && _err.message) {
          error[key] = makeJSONStringifiableError(err[key])
        } else {
          error[key] = err[key]
        }
      })

      return error
    }

    const TestEvent = function (event) {
      var self = {}
      event = Object.assign({}, event)

      self.type = getType(event.type)

      if (self.type === TestEvent.types.TEST) {
        testCount += 1
        self.count = testCount
      }

      if (typeof event.status === 'string' && STATUS_EXPRESSION.test(event.status)) {
        self.status = event.status
      } else if (event.status) {
        self.status = 'UNKNOWN'
      }

      if (event.behavior) {
        self.behavior = event.behavior
      }

      if (event.error) {
        self.error = makeJSONStringifiableError(event.error)
      }

      if (event.batchId) {
        self.batchId = event.batchId
      }

      if (event.suiteId) {
        self.suiteId = event.suiteId
      }

      if (event.plan) {
        self.plan = event.plan
      }

      if (typeof event.log !== 'undefined') {
        self.log = event.log
      }

      if (event.time) {
        self.time = event.time
      }

      if (event.totals) {
        self.totals = event.totals
      }

      if (event.context) {
        self.context = event.context
      }

      return Object.freeze(self)
    }

    TestEvent.types = {
      START: 'START',
      START_BATCH: 'START_BATCH',
      TEST: 'TEST',
      INFO: 'INFO',
      END_BATCH: 'END_BATCH',
      END_TALLY: 'END_TALLY',
      END: 'END'
    }

    TestEvent.status = {
      PASSED: 'PASSED',
      SKIPPED: 'SKIPPED',
      FAILED: 'FAILED',
      BROKEN: 'BROKEN'
    }

    function getType (type) {
      if (TYPE_EXPRESSION.test(type)) {
        return type
      }

      return 'UNKNOWN'
    }

    return { TestEvent }
  } // /factory
} // /module
