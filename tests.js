const suite = require('./index')
  // .Suite({
  //   timeout: 10000, // 10 seconds
  //   assertionLibrary: require('chai').expect
  // })
const runner = suite.runner({
  cwd: process.cwd(),
  directories: ['./tests'],
  matchesNamingConvention: {
    test: (input) => {
      return input.indexOf('namingspec.js') > -1
    }
  }, // /.(-namingspec\.js)$/i
  matchesIgnoredDirectory: /node_modules/i
})

console.log(runner.find())
runner.run()
