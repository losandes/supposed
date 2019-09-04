module.exports = {
  name: 'console-utils',
  factory: () => {
    'use strict'

    const move = (control) => (increment) => {
      increment = isNaN(increment)
        ? 0
        : Math.max(Math.floor(increment), 0)

      return increment
        ? `\x1b[${increment}${control}`
        : ''
    }

    const consoleUtils = {
      up: move('A'),
      down: move('B'),
      right: move('C'),
      left: move('D'),
      hide: () => '\u001b[?25l',
      show: () => '\u001b[?25h',
      deleteLine: () => '\u001b[2K',
      beginningOfLine: () => '\u001b[0G',
      clear: () => `${consoleUtils.deleteLine}${consoleUtils.beginningOfLine}`
    }

    return { consoleUtils }
  }
}
