const chai = require('chai')
const path = require('path')
const puppeteer = require('puppeteer')
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

module.exports = suite.runner({
  cwd: __projectdir,
  directories: ['./tests.browser'],
  title: 'supposed-browser-tests',
  port: 42002,
  stringifiedSuiteConfig: `{ reporter: '${suite.config.reporters[0].name || 'default'}', assertionLibrary: browserTestAssert }`,
  dependencies: ['/tests.browser/assert.js'],
  supposedPath: path.join(__projectdir, 'dist/supposed.js')
  // template: undefined,
  // stringifiedSuiteConfig: '{ noColor: true }'
}).startServer()
  .then(async (context) => {
    // console.log(context)
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    page.on('console', (msg) => {
      const txt = msg.text()
      console.log(txt)
      context.lastLine = txt
    })
    await page.goto(`http://localhost:${context.config.port}`, { waitUntil: 'networkidle2' })

    // await page.pdf({path: 'hn.pdf', format: 'A4'});

    await browser.close()
    context.server.close()

    return context
  })
// .run()
