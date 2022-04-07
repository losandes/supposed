module.exports = {
  name: 'readEnvvars',
  factory: () => {
    'use strict'

    function Switch (lowercaseLetter) { // eslint-disable-line no-unused-vars
      return { switch: `-${lowercaseLetter}`.toUpperCase() }
    }

    function Swatch (name) {
      return { switch: `--${name}`.toUpperCase() }
    }

    function Option (lowercaseLetter, name) {
      return {
        switch: Switch(lowercaseLetter).switch,
        option: Swatch(name).switch
      }
    }

    const findMatch = (switchesOrOptions, argValue, idx, args) => {
      const target = switchesOrOptions
      const _argValue = argValue.trim().toUpperCase()

      if (
        target.option &&
        args.length >= idx + 2 && ( // length is 1 based, and idx is 0 based so add 2
          target.option === _argValue ||
          target.switch === _argValue
        )
      ) {
        return args[idx + 1]
      } else if (
        target.switch === _argValue ||
        target.option === _argValue
      ) {
        return true
      }

      return false
    }

    const _readEnvvars = () => {
      const output = {
        reporters: process.env.SUPPOSED_REPORTERS
          ? process.env.SUPPOSED_REPORTERS.split(',').map((reporter) => reporter.trim().toUpperCase())
          : undefined,
        match: process.env.SUPPOSED_MATCH
          ? new RegExp(process.env.SUPPOSED_MATCH)
          : undefined,
        file: process.env.SUPPOSED_FILE
          ? new RegExp(process.env.SUPPOSED_FILE)
          : undefined,
        useColors: process.env.SUPPOSED_NO_COLOR && (
          process.env.SUPPOSED_NO_COLOR === 'true' ||
            process.env.SUPPOSED_NO_COLOR === '1'
        )
          ? false
          : undefined,
        suppressLogs: process.env.SUPPOSED_NO_LOGS && (
          process.env.SUPPOSED_NO_LOGS === 'true' ||
            process.env.SUPPOSED_NO_LOGS === '1'
        )
          ? true
          : undefined,
        timeUnits: process.env.SUPPOSED_TIME_UNITS
          ? process.env.SUPPOSED_TIME_UNITS.trim().toLowerCase()
          : undefined,
        reportOrder: process.env.SUPPOSED_REPORT_ORDER
          ? process.env.SUPPOSED_REPORT_ORDER.trim().toLowerCase()
          : undefined,
        verbosity: process.env.SUPPOSED_VERBOSITY
          ? process.env.SUPPOSED_VERBOSITY.trim().toLowerCase()
          : undefined
      }

      return output
    }

    const _readArgs = () => {
      const output = {}

      if (!Array.isArray(process.argv)) {
        return output
      }

      process.argv.forEach((value, idx, args) => {
        const reporters = findMatch(Option('r', 'reporter'), value, idx, args)
        const match = findMatch(Option('m', 'match'), value, idx, args)
        const file = findMatch(Option('f', 'file'), value, idx, args)
        const noColor = findMatch(Swatch('no-color'), value, idx, args)
        const noLogs = findMatch(Swatch('no-logs'), value, idx, args)
        const timeUnits = findMatch(Option('u', 'time-units'), value, idx, args)
        const reportOrder = findMatch(Option('o', 'report-order'), value, idx, args)
        const verbosity = findMatch(Option('v', 'verbosity'), value, idx, args)

        if (reporters) {
          output.reporters = reporters.split(',').map((reporter) => reporter.trim().toUpperCase())
        }

        if (match) {
          output.match = new RegExp(match)
        }

        if (file) {
          output.file = new RegExp(file)
        }

        if (noColor) {
          output.useColors = false
        }

        if (noLogs) {
          output.suppressLogs = true
        }

        if (timeUnits) {
          output.timeUnits = timeUnits.trim().toLowerCase()
        }

        if (reportOrder) {
          output.reportOrder = reportOrder.trim().toLowerCase()
        }

        if (verbosity) {
          output.verbosity = verbosity
        }
      }) // /forEach

      return output
    }

    const readEnvvars = () => {
      return { ..._readEnvvars(), ..._readArgs() }
    } // /readEnvvars

    return { readEnvvars }
  } // /factory
} // /module
