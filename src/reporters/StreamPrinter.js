'use strict'

module.exports = Printer

function Printer (options) {
  options = Object.assign({}, options)
  const stream = options.stream || process.stdout
  const tail = options.tail || '\n'

  var print = function () {
    const args = Array.prototype.slice.call(arguments)
    var output = []

    args.forEach(arg => {
      if (typeof arg === 'string') {
        output.push(arg)
      } else if (typeof arg === 'object') {
        if (arg.message) {
          output.push('  ' + arg.message)
        }

        if (arg.stack) {
          output.push('  ' + arg.stack)
        }
      }
    })

    return stream.write(output.join('\n') + tail)
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

  return Object.freeze({
    print: print,
    newLine: '\n'
  })
}
