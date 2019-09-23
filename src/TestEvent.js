module.exports = {
  name: 'TestEvent',
  factory: (dependencies) => {
    'use strict'

    const { clock } = dependencies
    const TYPE_EXPRESSION = /(^START$)|(^START_BATCH$)|(^START_TEST$)|(^TEST$)|(^END_BATCH$)|(^END_TALLY$)|(^FINAL_TALLY$)|(^END$)/
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

      if (event.suiteId) {
        self.suiteId = event.suiteId
      }

      if (event.batchId) {
        self.batchId = event.batchId
      }

      if (event.testId) {
        self.testId = event.testId
      }

      if (event.type === TestEvent.types.TEST) {
        testCount += 1
        self.count = testCount
      }

      if (typeof event.time === 'number' || typeof event.time === 'bigint') {
        self.time = event.time
      } else {
        self.time = clock()
      }

      self.type = getType(event.type)

      if (typeof event.status === 'string' && STATUS_EXPRESSION.test(event.status)) {
        self.status = event.status
      } else if (event.status) {
        self.status = 'UNKNOWN'
      }

      if (event.behavior) {
        self.behavior = event.behavior
      }

      if (Array.isArray(event.behaviors)) {
        self.behaviors = event.behaviors
      }

      if (event.plan) {
        self.plan = event.plan
      }

      if (event.error) {
        self.error = makeJSONStringifiableError(event.error)
      }

      if (typeof event.log !== 'undefined') {
        self.log = event.log
      }

      if (event.context) {
        self.context = event.context
      }

      if (event.duration) {
        self.duration = event.duration
      }

      if (event.tally) {
        self.tally = event.tally
      }

      if (event.totals) {
        self.totals = event.totals
      }

      return Object.freeze(self)
    }

    TestEvent.types = {
      START: 'START',
      START_BATCH: 'START_BATCH',
      START_TEST: 'START_TEST',
      TEST: 'TEST',
      END_BATCH: 'END_BATCH',
      END_TALLY: 'END_TALLY',
      FINAL_TALLY: 'FINAL_TALLY',
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
