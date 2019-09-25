const path = require('path')
const puppeteer = require('puppeteer')
const supposed = require('supposed')
const __projectdir = process.cwd()
const suite = supposed.Suite({
  name: 'browser-tests'
})

module.exports = suite.runner({
  // the title of the HTML page
  title: 'browser-tests',
  // the directories where your tests are
  directories: ['./tests.documentation/browser-tests'],
  // NOTE the "event" reporter - this is required for JSON.parse to work (below)
  stringifiedSuiteConfig: '{ reporter: "event", assertionLibrary: browserTestAssert }',
  // any libraries your app, library, or tests depend on
  dependencies: ['/tests.browser/assert.js'],
  port: 42003
}).startServer()
  .then(async (context) => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    page.on('console', async (msg) => {
      const txt = msg.text()

      try {
        const json = JSON.parse(txt)
        context.lastEvent = json
        suite.config.reporters.forEach((reporter) => reporter.write(json))

        if (json.type === 'END' && json.totals.failed > 0) {
          // maybe print a PDF that someone can review if this is being automated
          await page.pdf({ path: path.join(__projectdir, `test-log.${Date.now()}.pdf`), format: 'A4' })
        }
      } catch (e) {
        console.log(txt)
        context.lastEvent = txt
      }
    })

    await page.goto(`http://localhost:${context.config.port}`, { waitUntil: 'networkidle2' })
    await browser.close()

    return context
  })
