module.exports = {
  name: 'hash',
  factory: () => {
    const createBuffer = (input) => {
      if (typeof input !== 'string') {
        throw new Error('I only know how to hash strings')
      }

      const _arrBuffer = new ArrayBuffer(input.length * 2) // 2 bytes per char
      const _intBuffer = new Uint8Array(_arrBuffer)

      for (let i = 0; i < input.length; i += 1) {
        _intBuffer[i] = input.charCodeAt(i)
      }

      return _intBuffer
    }

    const isBuffer = (input) => input instanceof Uint8Array

    /**
     * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
     *
     * @author Derek Perez
     * @see https://github.com/perezd/node-murmurhash
     * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
     * @see http://github.com/garycourt/murmurhash-js
     * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
     * @see http://sites.google.com/site/murmurhash/
     *
     * @param {Buffer} key ASCII only
     * @param {number} seed Positive integer only
     * @return {number} 32-bit positive integer hash
     */
    function MurmurHashV3 (key, seed) {
      if (!isBuffer(key)) key = createBuffer(key)

      var remainder, bytes, h1, h1b, c1, c2, k1, i

      remainder = key.length & 3 // key.length % 4
      bytes = key.length - remainder
      h1 = seed
      c1 = 0xcc9e2d51
      c2 = 0x1b873593
      i = 0

      while (i < bytes) {
        k1 =
            ((key[i] & 0xff)) |
            ((key[++i] & 0xff) << 8) |
            ((key[++i] & 0xff) << 16) |
            ((key[++i] & 0xff) << 24)
        ++i

        k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff
        k1 = (k1 << 15) | (k1 >>> 17)
        k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff

        h1 ^= k1
        h1 = (h1 << 13) | (h1 >>> 19)
        h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16))
      }

      k1 = 0

      /* eslint-disable no-fallthrough */
      switch (remainder) {
        case 3: k1 ^= (key[i + 2] & 0xff) << 16
        case 2: k1 ^= (key[i + 1] & 0xff) << 8
        case 1: k1 ^= (key[i] & 0xff)

          k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff
          k1 = (k1 << 15) | (k1 >>> 17)
          k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff
          h1 ^= k1
      }
      /* eslint-enable no-fallthrough */

      h1 ^= key.length

      h1 ^= h1 >>> 16
      h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff
      h1 ^= h1 >>> 13
      h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff
      h1 ^= h1 >>> 16

      return h1 >>> 0
    }

    return { hash: MurmurHashV3 }
  }
}
