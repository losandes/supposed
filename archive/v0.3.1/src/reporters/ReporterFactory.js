module.exports = {
  name: 'ReporterFactory',
  factory: ReporterFactory
}

function ReporterFactory ({
  TestEvent,
  DefaultPrinter,
  ConsolePrinter,
  TapPrinter,
  BriefPrinter,
  QuietPrinter,
  StreamPrinter,
  NyanPrinter,
  DomPrinter,
  DefaultReporter,
  Reporter,
  consoleStyles
}) {
  const reporters = {
    BLOCK: 'BLOCK',
    BRIEF: 'BRIEF',
    CONSOLE: 'CONSOLE',
    DEFAULT: 'DEFAULT',
    DOM: 'DOM',
    NYAN: 'NYAN',
    QUIET: 'QUIET',
    QUIET_TAP: 'QUIET_TAP',
    TAP: 'TAP'
  }
  const SYMBOLS = {
    passed: consoleStyles.green('✓ '), // heavy-check: '✔',
    failed: consoleStyles.red('✗ '), // heavy-x '✘',
    skipped: consoleStyles.yellow('⸕ '),
    info: consoleStyles.cyan('→ ')
  }
  const BLOCKS = {
    passed: consoleStyles.bgGreen(consoleStyles.black('  PASS  ')),
    failed: consoleStyles.bgRed(consoleStyles.black('  FAIL  ')),
    skipped: consoleStyles.bgYellow(consoleStyles.black('  SKIP  ')),
    info: consoleStyles.bgCyan(consoleStyles.black('  INFO  '))
  }

  return {
    get: (name) => {
      switch (`${name}`.toUpperCase()) {
        case reporters.CONSOLE:
          return new DefaultReporter(() => new ConsolePrinter(consoleStyles, SYMBOLS), TestEvent)
        case reporters.NYAN:
          return new DefaultReporter(() => new NyanPrinter(new StreamPrinter({ tail: '' }), consoleStyles), TestEvent)
        case reporters.TAP:
          return new DefaultReporter(() => new TapPrinter(new StreamPrinter()), TestEvent)
        case reporters.DOM:
          return new DefaultReporter(() => new DomPrinter(consoleStyles, BLOCKS), TestEvent)
        case reporters.QUIET_TAP:
          return new DefaultReporter(() => new TapPrinter(new QuietPrinter(consoleStyles)), TestEvent)
        case reporters.BRIEF:
          return new DefaultReporter(() => new BriefPrinter(new ConsolePrinter(consoleStyles, SYMBOLS)), TestEvent)
        case reporters.QUIET:
          return new DefaultReporter(() => new QuietPrinter(consoleStyles), TestEvent)
        case reporters.BLOCK:
          return new DefaultReporter(() => new ConsolePrinter(consoleStyles, BLOCKS), TestEvent)
        default:
          return new DefaultReporter(() => new DefaultPrinter(consoleStyles, SYMBOLS), TestEvent)
      }
    },
    make: (reporter) => {
      return new Reporter(reporter)
    },
    types: reporters
  }
}
