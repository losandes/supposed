module.exports = {
  name: 'readEnvvars',
  factory: () => {
    'use strict'

    function Switch (lowercaseLetter) { // eslint-disable-line no-unused-vars
      return { switch: `-${lowercaseLetter}`.toUpperCase() }
    }

    function Swatch (name) { // eslint-disable-line no-unused-vars
      return { swatch: `--${name}`.toUpperCase() }
    }

    function Option (lowercaseLetter, name) {
      return {
        switch: `-${lowercaseLetter}`.toUpperCase(),
        option: `--${name}`.toUpperCase()
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
      } else if (target.swatch === _argValue) {
        return true
      } else if (target.switch === _argValue) {
        return true
      }

      return false
    }

    const readEnvvars = () => {
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
        ) ? false
          : undefined
      }

      if (!Array.isArray(process.argv)) {
        return output
      }

      process.argv.forEach((value, idx, args) => {
        const reporters = findMatch(Option('r', 'reporter'), value, idx, args)
        const match = findMatch(Option('m', 'match'), value, idx, args)
        const file = findMatch(Option('f', 'file'), value, idx, args)
        const noColor = findMatch(Swatch('no-color'), value, idx, args)

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
      }) // /forEach

      return output
    } // /readEnvvars

    return { readEnvvars }
  } // /factory
} // /module
