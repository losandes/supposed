'use strict'

module.exports = Printer

function Printer (options) {
  'use strict'

  options = Object.assign({}, options)
  const stream = options.stream || process.stdout
  const tail = options.tail || '\n'

  const isError = (arg) => {
    return typeof arg === 'object' &&
      typeof arg.message === 'string'
  }

  const isErrorWithStack = (arg) => {
    return isError(arg) && typeof arg.stack === 'string'
  }

  let print = function () {
    const args = Array.prototype.slice.call(arguments)

    return stream.write(args.map((arg) => {
      if (typeof arg === 'string') {
        return arg
      } else if (isErrorWithStack(arg)) {
        return `  ${arg.message}\n  ${arg.stack}`
      } else if (isError(arg)) {
        return `  ${arg.message}`
      }
    }).join('\n') + tail)
  }

  print.start = print
  print.startTest = print
  print.success = print
  print.skipped = print
  print.failed = print
  print.broken = print
  print.info = print
  print.totals = print
  print.end = print

  const getWindowSize = () => {
    const size = typeof stream.getWindowSize === 'function'
      ? stream.getWindowSize(1)
      : [75, 4]

    return {
      width: size[0],
      height: size[1]
    }
  }

  return Object.freeze({
    print: print,
    newLine: '\n',
    getWindowSize
  })
}
