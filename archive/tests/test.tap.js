var Parser = require('tap-parser')
var p = new Parser(function (results) {
  console.dir(results, { depth: null })
})

process.stdin.pipe(p)
