const chai = require('chai')
const path = require('path')
const supposed = require('../index.js')
const suite = supposed.Suite({
  inject: {
    describe: supposed,
    chai,
    path
  }
})

suite.runner({
  cwd: path.join(__dirname),
  matchesIgnoredConvention: /discoverer-meta-specs|node_modules/i
}).run()
// .then((context) => {
//   console.log(context.files)
// })

// suite.find({
//   cwd: path.join(__dirname, 'tests'),
//   matchesIgnoredConvention: /discoverer-meta-specs|node_modules/i
// }).run();

// suite.find({
//   cwd: path.join(__dirname, 'tests'),
//   matchesIgnoredConvention: /discoverer-meta-specs|node_modules/i
// }).server({ port: 3001 }).start();
