module.exports = {
  name: 'assertTypes',
  factory: Types()
}

function Types () {
  function uncurryThis (f) {
    return f.call.bind(f)
  }

  const TypedArrayPrototype = Object.getPrototypeOf(Uint8Array.prototype)

  const toStringTag =
      uncurryThis(
        Object.getOwnPropertyDescriptor(TypedArrayPrototype,
          Symbol.toStringTag).get)

  // Cached to make sure no userland code can tamper with it.
  const isArrayBufferView = ArrayBuffer.isView

  function isTypedArray (value) {
    return toStringTag(value) !== undefined
  }

  function isUint8Array (value) {
    return toStringTag(value) === 'Uint8Array'
  }

  function isUint8ClampedArray (value) {
    return toStringTag(value) === 'Uint8ClampedArray'
  }

  function isUint16Array (value) {
    return toStringTag(value) === 'Uint16Array'
  }

  function isUint32Array (value) {
    return toStringTag(value) === 'Uint32Array'
  }

  function isInt8Array (value) {
    return toStringTag(value) === 'Int8Array'
  }

  function isInt16Array (value) {
    return toStringTag(value) === 'Int16Array'
  }

  function isInt32Array (value) {
    return toStringTag(value) === 'Int32Array'
  }

  function isFloat32Array (value) {
    return toStringTag(value) === 'Float32Array'
  }

  function isFloat64Array (value) {
    return toStringTag(value) === 'Float64Array'
  }

  function isBigInt64Array (value) {
    return toStringTag(value) === 'BigInt64Array'
  }

  function isBigUint64Array (value) {
    return toStringTag(value) === 'BigUint64Array'
  }

  return {
    isArrayBufferView,
    isTypedArray,
    isUint8Array,
    isUint8ClampedArray,
    isUint16Array,
    isUint32Array,
    isInt8Array,
    isInt16Array,
    isInt32Array,
    isFloat32Array,
    isFloat64Array,
    isBigInt64Array,
    isBigUint64Array
  }
}
