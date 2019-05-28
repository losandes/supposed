// inspired by [karma-nyan-reporter](https://github.com/dgarlitt/karma-nyan-reporter)
'use strict'

module.exports = Printer

function Printer (streamPrinter, styles) {
  'use strict'

  const { rainbowify } = new Rainbowifier()
  const size = streamPrinter.getWindowSize()
  const width = size.width * 0.75 | 0
  // const maxHeight = size.height - 1
  const numberOfLines = 4 // Math.max(4, Math.min(config.numberOfLines, maxHeight))
  const UP = styles.up(numberOfLines)
  const nyanCatWidth = 11
  const scoreboardWidth = 5
  const trajectoryWidthMax = (width - nyanCatWidth)
  const stats = { total: 0, success: 0, failed: 0, skipped: 0, errors: [] }
  const trajectories = []

  for (let i = 0; i < numberOfLines; i++) {
    trajectories[i] = []
  }

  let tick = 0
  let specCount = 0
  const printerOutput = []

  const print = (line) => {
    streamPrinter.print(line)
  }

  const drawScoreboard = () => {
    print(` ${styles.cyan(stats.total)}${styles.newLine()}`)
    print(` ${styles.green(stats.success)}${styles.newLine()}`)
    print(` ${styles.red(stats.failed)}${styles.newLine()}`)
    print(` ${styles.yellow(stats.skipped)}${styles.newLine()}`)
  }

  const drawRainbow = () => {
    trajectories.forEach((line) => {
      print(`\u001b[${scoreboardWidth}C${line.join('')}${styles.newLine()}`)
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

  const face = () => {
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

  const drawNyanCat = () => {
    const startWidth = scoreboardWidth + trajectories[0].length
    const color = `\u001b[${startWidth}C`

    print(`${color}_,------,${styles.newLine()}`)

    ;(() => {
      const padding = tick ? '  ' : '   '
      print(`${color}_|${padding}/\\_/\\ ${styles.newLine()}`)
    })()

    ;(() => {
      const padding = tick ? '_' : '__'
      const tail = tick ? '~' : '^'
      print(`${color}${tail}|${padding}${face()} ${styles.newLine()}`)
    })()

    ;(() => {
      const padding = tick ? ' ' : '  '
      print(`${color}${padding}  ""  "" ${styles.newLine()}`)
    })()
  }

  const fillWithNewLines = (startFrom) => {
    for (let i = startFrom || 0; i < numberOfLines + 1; i++) {
      print(styles.newLine())
    }
  }

  const draw = () => {
    fillWithNewLines(numberOfLines + 1)
    print(UP)
    appendRainbow()
    drawScoreboard()
    fillWithNewLines(numberOfLines + 1)
    print(UP)
    drawRainbow()
    print(UP)
    drawNyanCat()
    tick = !tick
  }

  print.start = function (message) {
    specCount += 1

    if (specCount === 1) {
      print(styles.newLine())
      print(styles.hide())
      drawScoreboard()
    }
  }

  print.startTest = function (message) {
    /* suppress */
  }

  print.success = function (behavior) {
    stats.success += 1
    stats.total += 1
    draw()
    printerOutput.push({ behavior, status: 'SUCCESS' })
  }

  print.skipped = function (behavior) {
    stats.skipped += 1
    stats.total += 1
    draw()
    printerOutput.push({ behavior, status: 'SKIPPED' })
  }

  print.failed = function (behavior, e) {
    stats.failed += 1
    stats.total += 1
    draw()
    let err = `${styles.newLine()}${styles.bgRed(styles.black(' ' + behavior))}${styles.newLine()}${styles.newLine()}`

    if (e && e.expected && e.actual) {
      err += `    expected: ${styles.green(e.expected)}    actual: ${styles.red(e.actual)}${styles.newLine()}${styles.newLine()}`
    }

    if (e) {
      err += `${e}${styles.newLine()}`
    }

    stats.errors.push(err)
    printerOutput.push({ behavior, err, status: 'FAILED' })
  }

  print.broken = print.failed

  print.info = function (behavior, e) {
    printerOutput.push({ behavior, e, status: 'INFO' })
  }

  print.totals = function (totals) {
    var output = styles.newLine() + '  total: ' + styles.cyan(totals.total)
    output += '  passed: ' + styles.green(totals.passed)
    output += '  failed: ' + styles.red(totals.failed + totals.broken)
    output += '  skipped: ' + styles.yellow(totals.skipped)
    output += '  duration: ' + ((totals.endTime - totals.startTime) / 1000) + 's' + styles.newLine()

    print(output)
    stats.errors.forEach(print)
    print(styles.show())
  }

  print.end = function (message) {
    print(message)
  }

  return Object.freeze({
    name: 'NYAN',
    print: print,
    newLine: styles.newLine(),
    getOutput: () => { return printerOutput.join(styles.newLine()) }
  })
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
