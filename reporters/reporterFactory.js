'use strict'
const DefaultPrinter = require('./DefaultPrinter.js')
const TapPrinter = require('./TapPrinter.js')
const BriefPrinter = require('./BrevityPrinter.js')
const QuietPrinter = require('./QuietPrinter.js')
const Reporter = require('./Reporter.js')
const reporters = {
  DEFAULT: 'DEFAULT',
  TAP: 'TAP',
  BRIEF: 'BRIEF',
  QUIET: 'QUIET'
}

const factory = {
  get: (name) => {
    switch (name) {
      case reporters.TAP:
        return new Reporter(new TapPrinter())
      case reporters.BRIEF:
        return new Reporter(new BriefPrinter())
      case reporters.QUIET:
        return new Reporter(new QuietPrinter())
      default:
        return new Reporter(new DefaultPrinter())
    }
  },
  types: reporters
}

module.exports = factory
