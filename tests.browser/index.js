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

const __projectdir = __dirname.split('tests.browser')[0]

suite.runner({
  cwd: __projectdir,
  directories: ['./tests.browser'],
  title: 'supposed-browser-tests',
  port: 42002,
  stringifiedSuiteConfig: '{ reporter: \'tap\', assertionLibrary: browserTestAssert }',
  dependencies: ['/tests.browser/assert.js'],
  supposedPath: path.join(__projectdir, 'dist/supposed.js')
  // template: undefined,
  // stringifiedSuiteConfig: '{ noColor: true }'
}).startServer()
// .run()
