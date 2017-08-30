'use strict'

const TYPE_EXPRESSION = /(^START$)|(^START_TEST$)|(^PASSED$)|(^SKIPPED$)|(^FAILED$)|(^BROKEN$)|(^END$)|(^UNKNOWN$)/
const TestEvent = function (result) {
  var self = {}
  result = Object.assign({}, result)

  self.type = getType(result.type)

  if (result.behavior) {
    self.behavior = result.behavior
  }

  if (result.error) {
    self.error = result.error
  }

  if (result.plan) {
    self.plan = result.plan
  }

  return Object.freeze(self)
}

TestEvent.types = {
  START: 'START',
  START_TEST: 'START_TEST',
  PASSED: 'PASSED',
  SKIPPED: 'SKIPPED',
  FAILED: 'FAILED',
  BROKEN: 'BROKEN',
  END: 'END',
  UNKNOWN: 'UNKNOWN'
}

TestEvent.start = new TestEvent({ type: TestEvent.types.START })
TestEvent.startTest = new TestEvent({ type: TestEvent.types.START_TEST })
TestEvent.end = new TestEvent({ type: TestEvent.types.END })

function getType (type) {
  if (TYPE_EXPRESSION.test(type)) {
    return type
  }

  return TestEvent.types.UNKNOWN
}

module.exports = TestEvent
