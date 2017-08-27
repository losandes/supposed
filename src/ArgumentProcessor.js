module.exports = ArgumentProcessor

function ArgumentProcessor (reporters) {
  return {
    get: processArgv
  }

  function processArgv () {
    var output = {
      reporter: reporters.types.DEFAULT
    }

    process.argv.forEach((value, idx, args) => {
      if (argvMatches(['--tap', '-t', { switch: '-r', value: reporters.types.TAP }], value, idx, args)) {
        output.reporter = reporters.types.TAP
      } else if (argvMatches(['--brief', { switch: '-r', value: reporters.types.BRIEF }], value, idx, args)) {
        output.reporter = reporters.types.BRIEF
      } else if (argvMatches(['--quiet', '-q', { switch: '-r', value: reporters.types.QUIET }], value, idx, args)) {
        output.reporter = reporters.types.QUIET
      } else if (argvMatches(['--quiet-tap', '-qt', { switch: '-r', value: reporters.types.QUIET_TAP }], value, idx, args)) {
        output.reporter = reporters.types.QUIET_TAP
      }
    })

    return output
  }

  function argvMatches (targets, value, idx, args) {
    for (let i = 0; i < targets.length; i += 1) {
      let target = targets[i]

      if (typeof target === 'string' && value === target) {
        return true
      } else if (typeof target === 'object') {
        let nextValue = args.length >= idx + 1 ? args[idx + 1] : null
        nextValue = nextValue ? nextValue.toUpperCase() : null

        if (value === target.switch && nextValue === target.value) {
          return true
        }
      }
    }

    return false
  }
}
