const fs = require('fs')
const path = require('path')

module.exports = require('supposed')
  .runner({
    cwd: process.cwd(),
    port: 42006,
    directories: ['./deadend'],
    title: 'custom-template',
    dependencies: [
      'tests.documentation/runners/using-browser-test-server-custom-template/first-spec.js',
      'tests.documentation/runners/using-browser-test-server-custom-template/second-spec.js'
    ],
    // scripts: [
    //   fs.readFileSync(path.join(__dirname, 'first-spec.js')).toString(),
    //   fs.readFileSync(path.join(__dirname, 'second-spec.js')).toString()
    // ],
    template: fs.readFileSync(path.join(__dirname, 'test-template.js')).toString()
  })
  .startServer()
