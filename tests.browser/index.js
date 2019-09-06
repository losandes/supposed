const chai = require('chai')
const path = require('path')
const supposed = require('../index.js')

const suite = supposed.Suite({
  name: 'supposed-tests.manual',
  inject: {
    describe: supposed,
    chai,
    path
  }
})

suite.runner({
  cwd: __dirname,
  title: 'supposed-browser-tests',
  port: 42002
  // dependencies: [],
  // supposedPath: path.join(__dirname.split('/src/discovery'), 'dist/supposed.min.js'),
  // template: undefined,
  // stringifiedSuiteConfig: '{ noColor: true }'
}).startServer()
