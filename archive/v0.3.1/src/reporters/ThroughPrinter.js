'use strict'

module.exports = {
  name: 'ThroughPrinter',
  factory: ThroughPrinter
}

const Stream = require('stream')

function ThroughPrinter (options) {
  'use strict'

  options = Object.assign({}, options)
  const stream = through()
  const tail = typeof options.tail === 'string' ? options.tail : '\n'

  const isError = (arg) => {
    return typeof arg === 'object' &&
      typeof arg.message === 'string'
  }

  const isErrorWithStack = (arg) => {
    return isError(arg) && typeof arg.stack === 'string'
  }

  const print = function () {
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

// from https://github.com/dominictarr/through
function through (write, end, opts) {
  write = write || function (data) { this.queue(data) }
  end = end || function () { this.queue(null) }

  var ended = false; var destroyed = false; var buffer = []; var _ended = false
  var stream = new Stream()
  stream.readable = stream.writable = true
  stream.paused = false

  //  stream.autoPause   = !(opts && opts.autoPause   === false)
  stream.autoDestroy = !(opts && opts.autoDestroy === false)

  stream.write = function (data) {
    write.call(this, data)
    return !stream.paused
  }

  function drain () {
    while (buffer.length && !stream.paused) {
      var data = buffer.shift()
      if (data === null) { return stream.emit('end') } else { stream.emit('data', data) }
    }
  }

  stream.queue = stream.push = function (data) {
    //    console.error(ended)
    if (_ended) return stream
    if (data === null) _ended = true
    buffer.push(data)
    drain()
    return stream
  }

  // this will be registered as the first 'end' listener
  // must call destroy next tick, to make sure we're after any
  // stream piped from here.
  // this is only a problem if end is not emitted synchronously.
  // a nicer way to do this is to make sure this is the last listener for 'end'

  stream.on('end', function () {
    stream.readable = false
    if (!stream.writable && stream.autoDestroy) {
      process.nextTick(function () {
        stream.destroy()
      })
    }
  })

  function _end () {
    stream.writable = false
    end.call(stream)
    if (!stream.readable && stream.autoDestroy) { stream.destroy() }
  }

  stream.end = function (data) {
    if (ended) return
    ended = true
    if (arguments.length) stream.write(data)
    _end() // will emit or queue
    return stream
  }

  stream.destroy = function () {
    if (destroyed) return
    destroyed = true
    ended = true
    buffer.length = 0
    stream.writable = stream.readable = false
    stream.emit('close')
    return stream
  }

  stream.pause = function () {
    if (stream.paused) return
    stream.paused = true
    return stream
  }

  stream.resume = function () {
    if (stream.paused) {
      stream.paused = false
      stream.emit('resume')
    }
    drain()
    // may have become paused again,
    // as drain emits 'data'.
    if (!stream.paused) { stream.emit('drain') }
    return stream
  }
  return stream
}
