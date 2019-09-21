const fs = require('fs')
const babel = require('@babel/core')

const template = fs.readFileSync('./index.browser.js').toString().split('// MODULES_HERE')
const beginning = template[0]
const end = template[1]
const modules = [beginning]

// modules.push('function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }')
// modules.push('function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }')

// src
modules.push(fs.readFileSync('./src/all-settled.js'))
modules.push(fs.readFileSync('./src/AsyncTest.js'))
modules.push(fs.readFileSync('./src/hash.js'))
modules.push(fs.readFileSync('./src/make-batch.js'))
modules.push(fs.readFileSync('./src/make-suite-config.js'))
modules.push(fs.readFileSync('./src/pubsub.js'))
modules.push(fs.readFileSync('./src/Suite.js'))
modules.push(fs.readFileSync('./src/TestEvent.js'))
modules.push(fs.readFileSync('./src/time.js'))

// runners
modules.push(fs.readFileSync('./src/runners/run-tests.js'))

// formatters
modules.push(fs.readFileSync('./src/formatters/browser-console-styles.js'))
modules.push(fs.readFileSync('./src/formatters/BlockFormatter.js'))
modules.push(fs.readFileSync('./src/formatters/BriefFormatter.js'))
modules.push(fs.readFileSync('./src/formatters/DefaultFormatter.js'))
modules.push(fs.readFileSync('./src/formatters/ListFormatter.js'))
modules.push(fs.readFileSync('./src/formatters/JsonFormatter.js'))
modules.push(fs.readFileSync('./src/formatters/MarkdownFormatter.js'))
modules.push(fs.readFileSync('./src/formatters/PerformanceFormatter.js'))
modules.push(fs.readFileSync('./src/formatters/SpecFormatter.js'))
modules.push(fs.readFileSync('./src/formatters/SummaryFormatter.js'))
modules.push(fs.readFileSync('./src/formatters/TapFormatter.js'))

// reporters
modules.push(fs.readFileSync('./src/reporters/ArrayReporter.js'))
modules.push(fs.readFileSync('./src/reporters/ConsoleReporter.js'))
modules.push(fs.readFileSync('./src/reporters/DomReporter.js'))
modules.push(fs.readFileSync('./src/reporters/NoopReporter.js'))
modules.push(fs.readFileSync('./src/reporters/reporter-factory.js'))
modules.push(fs.readFileSync('./src/reporters/Tally.js'))

modules.push(end)

// const output = { code: modules.join('\n') }
// const minOutput = { code: modules.join('\n') }
const output = babel.transform(modules.join('\n'), {
  minified: false,
  presets: [
    [
      '@babel/preset-env',
      {
        // useBuiltIns: 'usage',
        // corejs: 3, // or 2,
        targets: '> 0.25%, not dead'
      }
    ]
  ]
  // plugins: [['@babel/plugin-transform-async-to-generator']]
  // plugins: [['@babel/transform-runtime', { corejs: 3, regenerator: true }]]
})

const minOutput = babel.transform(modules.join('\n'), {
  minified: true,
  presets: [
    [
      '@babel/preset-env',
      {
        // useBuiltIns: 'usage',
        // corejs: 3, // or 2,
        targets: '> 0.25%, not dead'
      }
    ]
  ]
  // plugins: [['@babel/plugin-transform-async-to-generator']]
  // plugins: [['@babel/transform-runtime', { regenerator: true }]]
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
