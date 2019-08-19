/**
 * assertion-error
 * Adapted from chaijs (https://github.com/chaijs/assertion-error)
 */

/**
 * Return a function that will copy properties from
 * one object to another excluding any originally
 * listed. Returned function will create a new `{}`.
 *
 * @param {String} excluded properties ...
 * @return {Function}
 */

/**
 * Primary Exports
 */

module.exports = {
  name: 'AssertionError',
  factory: AssertionError
}

function exclude () {
  var excludes = [].slice.call(arguments)

  function excludeProps (res, obj) {
    Object.keys(obj).forEach(function (key) {
      if (!~excludes.indexOf(key)) res[key] = obj[key]
    })
  }

  return function extendExclude () {
    var args = [].slice.call(arguments)
    var i = 0
    var res = {}

    for (; i < args.length; i++) {
      excludeProps(res, args[i])
    }

    return res
  }
};

/**
 * ### AssertionError
 *
 * An extension of the JavaScript `Error` constructor for
 * assertion and validation scenarios.
 *
 * @param {String} message
 * @param {Object} properties to include (optional)
 * @param {callee} start stack function (optional)
 */

function AssertionError (message, _props, ssf) {
  var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON')
  var props = extend(_props || {})

  // default values
  this.message = message || 'Unspecified AssertionError'
  this.showDiff = false

  // copy from properties
  for (var key in props) {
    this[key] = props[key]
  }

  // capture stack trace
  ssf = ssf || AssertionError
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, ssf)
  } else {
    try {
      throw new Error()
    } catch (e) {
      this.stack = e.stack
    }
  }
}

/**
 * Inherit from Error.prototype
 */

AssertionError.prototype = Object.create(Error.prototype)

/**
 * Statically set name
 */

AssertionError.prototype.name = 'AssertionError'

/**
 * Ensure correct constructor
 */

AssertionError.prototype.constructor = AssertionError

/**
 * Allow errors to be converted to JSON for static transfer.
 *
 * @param {Boolean} include stack (default: `true`)
 * @return {Object} object that can be `JSON.stringify`
 */

AssertionError.prototype.toJSON = function (stack) {
  var extend = exclude('constructor', 'toJSON', 'stack')
  var props = extend({ name: this.name }, this)

  // include stack if exists and not turned off
  if (stack !== false && this.stack) {
    props.stack = this.stack
  }

  return props
}
