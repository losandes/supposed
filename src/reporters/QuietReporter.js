module.exports = {
  name: 'QuietReporter',
  factory: () => {
    'use strict'

    function QuietReporter () {
      const write = async () => {} // /write

      return { write }
    }

    return { QuietReporter }
  }
}
