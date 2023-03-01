module.exports = {
  name: 'consoleStyles',
  factory: () => {
    'use strict'

    const consoleStyles = [
      { name: 'reset', value: [0, 0] },

      { name: 'bold', value: [1, 22] },
      { name: 'italic', value: [3, 23] },
      { name: 'underline', value: [4, 24] },
      { name: 'dim', value: [2, 22] },
      { name: 'hidden', value: [8, 28] },
      { name: 'strikethrough', value: [9, 29] },
      { name: 'inverse', value: [7, 27] },

      { name: 'black', value: [30, 39] },
      { name: 'blue', value: [34, 39] },
      { name: 'cyan', value: [96, 39] },
      { name: 'green', value: [32, 39] },
      { name: 'green-hi', value: [92, 32] },
      { name: 'grey', value: [90, 39] },
      { name: 'magenta', value: [35, 39] },
      { name: 'red', value: [31, 39] },
      { name: 'white', value: [37, 39] },
      { name: 'yellow', value: [33, 39] },

      { name: 'bgBlack', value: [40, 49] },
      { name: 'bgRed', value: [41, 49] },
      { name: 'bgGreen', value: [42, 49] },
      { name: 'bgYellow', value: [43, 49] },
      { name: 'bgBlue', value: [44, 49] },
      { name: 'bgMagenta', value: [45, 49] },
      { name: 'bgCyan', value: [46, 49] },
      { name: 'bgWhite', value: [47, 49] },
    ].reduce((styles, style) => {
      styles[style.name] = (input) => input

      return styles
    }, {})

    consoleStyles.newLine = () => '\n'
    consoleStyles.space = () => ' '

    return { consoleStyles }
  },
}
