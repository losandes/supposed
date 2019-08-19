const fs = require('fs')
const babel = require('@babel/core')

const template = fs.readFileSync('./index.browser.js').toString().split('// MODULES_HERE')
const beginning = template[0]
const end = template[1]
const modules = [beginning]

// src
modules.push(fs.readFileSync('./src/AsyncTest.js').toString())
modules.push(fs.readFileSync('./src/configFactory.js').toString())
modules.push(fs.readFileSync('./src/promiseUtils.js').toString())
modules.push(fs.readFileSync('./src/TestBatch.js').toString())
modules.push(fs.readFileSync('./src/TestEvent.js').toString())
modules.push(fs.readFileSync('./src/Suite.js').toString())

// assertions
// const SupposeFactory = require('./src/assertions/Suppose.js').factory

// reporters
modules.push(fs.readFileSync('./src/reporters/BrowserConsolePrinter.js').toString())
modules.push(fs.readFileSync('./src/reporters/console-styles.js').toString())
modules.push(fs.readFileSync('./src/reporters/DefaultReporter.js').toString())
modules.push(fs.readFileSync('./src/reporters/DomPrinter.js').toString())
modules.push(fs.readFileSync('./src/reporters/NyanPrinter.js').toString())
modules.push(fs.readFileSync('./src/reporters/QuietPrinter.js').toString())
modules.push(fs.readFileSync('./src/reporters/TapPrinter.js').toString())
modules.push(fs.readFileSync('./src/reporters/Reporter.js').toString())
modules.push(fs.readFileSync('./src/reporters/ReporterFactory.js').toString())

// runners
modules.push(fs.readFileSync('./src/runners/DefaultRunner.js').toString())

modules.push(end)

const output = babel.transform(modules.join('\n'), {
  minified: false,
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.25%, not dead'
      }
    ]
  ]
})

const minOutput = babel.transform(modules.join('\n'), {
  minified: true,
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.25%, not dead'
      }
    ]
  ]
})

// {
//   targets: {
//     // The % refers to the global coverage of users from browserslist
//     browsers: [
//       'last 2 Chrome versions',
//       'last 2 ie versions',
//       'not ie <= 10',
//       'last 2 Edge versions',
//       'last 2 Firefox versions',
//       'last 2 Safari versions',
//       'last 2 iOS versions',
//       'last 2 Android versions'
//     ]
//   }
// }

fs.writeFileSync('./dist/supposed.js', output.code)
fs.writeFileSync('./dist/supposed.min.js', minOutput.code)
console.log('Published browser version to `./dist`')
process.exit(0)
