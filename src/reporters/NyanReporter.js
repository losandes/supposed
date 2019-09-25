module.exports = {
  name: 'NyanReporter',
  factory: (dependencies) => {
    'use strict'

    const { consoleStyles, consoleUtils, TestEvent, DefaultFormatter } = dependencies
    const newLine = consoleStyles.newLine()
    const { format } = DefaultFormatter({
      SYMBOLS: {
        PASSED: consoleStyles.green('✓ '), // heavy-check: '✔',
        FAILED: consoleStyles.red('✗ '), // heavy-x '✘',
        BROKEN: consoleStyles.red('!= '), // heavy-x '✘',
        SKIPPED: consoleStyles.yellow('⸕ '),
        INFO: consoleStyles.cyan('# ')
      }
    })
    const print = (input, tail) => {
      process.stdout.write(input)

      return input
    }

    /*
    // Generate rainbow colors
    */
    function generateColors () {
      const colors = []

      for (let i = 0; i < (6 * 7); i++) {
        const pi3 = Math.floor(Math.PI / 3)
        const n = (i * (1.0 / 6))
        const r = Math.floor(3 * Math.sin(n) + 3)
        const g = Math.floor(3 * Math.sin(n + 2 * pi3) + 3)
        const b = Math.floor(3 * Math.sin(n + 4 * pi3) + 3)
        colors.push(36 * r + 6 * g + b + 16)
      }

      return colors
    }

    function Rainbowifier () {
      let colorIndex = 0
      const rainbowColors = generateColors()

      const rainbowify = (input) => {
        const color = rainbowColors[colorIndex % rainbowColors.length]
        colorIndex += 1
        return `\u001b[38;5;${color}m${input}\u001b[0m`
      }

      const reset = () => {
        colorIndex = 0
      }

      return { rainbowify, reset }
    }

    function getWindowSize () {
      const size = typeof process !== 'undefined' &&
        process.stdout &&
        typeof process.stdout.getWindowSize === 'function'
        ? process.stdout.getWindowSize()
        : [75, 4]

      return {
        width: size[0],
        height: size[1]
      }
    }

    function NyanPrinter () {
      let initialized = false
      // const { print, styles, windowSize } = options
      const { rainbowify } = new Rainbowifier()
      const windowSize = getWindowSize()
      const width = windowSize.width * 0.75 | 0
      const numberOfLines = 4
      const UP = consoleUtils.up(numberOfLines)
      const nyanCatWidth = 11
      const scoreboardWidth = 5
      const trajectoryWidthMax = (width - nyanCatWidth)
      const trajectories = [...Array(numberOfLines)].map(() => [])
      let tick = 0

      const drawScoreboard = (stats) => {
        print(` ${consoleStyles.cyan(stats.total)}${newLine}`)
        print(` ${consoleStyles.green(stats.success)}${newLine}`)
        print(` ${consoleStyles.red(stats.failed)}${newLine}`)
        print(` ${consoleStyles.yellow(stats.skipped)}${newLine}`)
      }

      const drawRainbow = () => {
        trajectories.forEach((line) => {
          print(`\u001b[${scoreboardWidth}C${line.join('')}${newLine}`)
        })
      }

      const appendRainbow = () => {
        const segment = rainbowify(tick ? '_' : '-')

        for (let i = 0; i < numberOfLines; i++) {
          const trajectory = trajectories[i]

          if (trajectory.length >= trajectoryWidthMax) {
            trajectory.shift()
          }
          trajectory.push(segment)
        }
      }

      const face = (stats) => {
        if (stats.failed) {
          return '( x .x)'
        } else if (stats.skipped) {
          return '( o .o)'
        } else if (stats.success) {
          return '( ^ .^)'
        } else {
          return '( - .-)'
        }
      }

      const drawNyanCat = (stats) => {
        const startWidth = scoreboardWidth + trajectories[0].length
        const color = `\u001b[${startWidth}C`

        print(`${color}_,------,${newLine}`)

        ;(() => {
          const padding = tick ? '  ' : '   '
          print(`${color}_|${padding}/\\_/\\ ${newLine}`)
        })()

        ;(() => {
          const padding = tick ? '_' : '__'
          const tail = tick ? '~' : '^'
          print(`${color}${tail}|${padding}${face(stats)} ${newLine}`)
        })()

        ;(() => {
          const padding = tick ? ' ' : '  '
          print(`${color}${padding}  ""  "" ${newLine}`)
        })()
      }

      const fillWithNewLines = (startFrom) => {
        for (let i = startFrom || 0; i < numberOfLines + 1; i++) {
          print(newLine)
        }
      }

      const draw = (stats) => {
        fillWithNewLines(numberOfLines + 1)
        print(UP)
        appendRainbow()
        drawScoreboard(stats)
        fillWithNewLines(numberOfLines + 1)
        print(UP)
        drawRainbow()
        print(UP)
        drawNyanCat(stats)
        tick = !tick
      }

      draw.begin = (stats) => {
        if (!initialized) {
          initialized = true
          print(newLine)
          print(consoleUtils.hide())
          drawScoreboard(stats)
        }
      }

      draw.end = (stats) => {
        print(consoleUtils.show())
      }

      return { draw }
    }

    function NyanReporter () {
      const { draw } = new NyanPrinter()
      const stats = { total: 0, success: 0, failed: 0, skipped: 0, errors: [] }

      const write = (event) => {
        if (event.type === TestEvent.types.START) {
          draw.begin(stats)
        } else if (event.type === TestEvent.types.END) {
          draw.end(stats)

          if (stats.errors.length) {
            print(newLine)
            stats.errors.forEach((err) => {
              print(err)
              print(newLine)
            })
          }

          print(format(event))
        } else if (event.type === TestEvent.types.TEST && event.status === TestEvent.status.PASSED) {
          stats.success += 1
          stats.total += 1
          draw(stats)
        } else if (event.type === TestEvent.types.TEST && event.status === TestEvent.status.SKIPPED) {
          stats.skipped += 1
          stats.total += 1
          draw(stats)
        } else if (event.type === TestEvent.types.TEST) { // broken || failed
          stats.failed += 1
          stats.total += 1
          draw(stats)
          stats.errors.push(format(event))
        }
      } // /write

      return { write }
    } // /NyanReporter

    return { NyanReporter }
  }
}
