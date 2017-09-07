module.exports = function Factory (
  TestEvent,
  DefaultPrinter,
  TapPrinter,
  BriefPrinter,
  QuietPrinter,
  StreamPrinter,
  DefaultReporter,
  Reporter,
  consoleStyles
) {
  const reporters = {
    DEFAULT: 'DEFAULT',
    TAP: 'TAP',
    QUIET_TAP: 'QUIET_TAP',
    BRIEF: 'BRIEF',
    QUIET: 'QUIET'
  }

  return {
    get: (name) => {
      switch (name) {
        case reporters.TAP:
          return new DefaultReporter(new TapPrinter(new StreamPrinter()), TestEvent)
        case reporters.QUIET_TAP:
          return new DefaultReporter(new TapPrinter(new QuietPrinter(consoleStyles)), TestEvent)
        case reporters.BRIEF:
          return new DefaultReporter(new BriefPrinter(new DefaultPrinter(consoleStyles)), TestEvent)
        case reporters.QUIET:
          return new DefaultReporter(new QuietPrinter(consoleStyles), TestEvent)
        default:
          return new DefaultReporter(new DefaultPrinter(consoleStyles), TestEvent)
      }
    },
    make: (reporter) => {
      return new Reporter(reporter)
    },
    types: reporters
  }
}
