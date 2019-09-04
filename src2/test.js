const chai = require('chai')
const path = require('path')
const supposed = require('.')
const suite = supposed.Suite({
  inject: {
    describe: supposed,
    chai,
    path
  }
})

// suite.subscribe(console.log)

suite.runner({
  cwd: path.join(__dirname, 'tests'),
  matchesIgnoredConvention: /discoverer-meta-specs|node_modules/i
}).run()
// .then((context) => {
//   console.log(context.files)
//   console.dir(context.results, { depth: null })
// })
