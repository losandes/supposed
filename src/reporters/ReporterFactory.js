module.exports = function Factory (
  TestEvent,
  DefaultPrinter,
  TapPrinter,
  BriefPrinter,
  QuietPrinter,
  StreamPrinter,
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
          return new Reporter(new TapPrinter(new StreamPrinter()), TestEvent)
        case reporters.QUIET_TAP:
          return new Reporter(new TapPrinter(new QuietPrinter(consoleStyles)), TestEvent)
        case reporters.BRIEF:
          return new Reporter(new BriefPrinter(new DefaultPrinter(consoleStyles)), TestEvent)
        case reporters.QUIET:
          return new Reporter(new QuietPrinter(consoleStyles), TestEvent)
        default:
          return new Reporter(new DefaultPrinter(consoleStyles), TestEvent)
      }
    },
    types: reporters
  }
}
