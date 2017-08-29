module.exports = function Factory (
  TestEvent,
  DefaultPrinter,
  TapPrinter,
  BriefPrinter,
  QuietPrinter,
  StreamPrinter,
  Reporter
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
          return new Reporter(new TapPrinter(new QuietPrinter()), TestEvent)
        case reporters.BRIEF:
          return new Reporter(new BriefPrinter(new DefaultPrinter()), TestEvent)
        case reporters.QUIET:
          return new Reporter(new QuietPrinter(), TestEvent)
        default:
          return new Reporter(new DefaultPrinter(), TestEvent)
      }
    },
    types: reporters
  }
}
