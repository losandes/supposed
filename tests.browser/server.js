const path = require('path')
const puppeteer = require('puppeteer')
const supposed = require('../index.js')

const suite = supposed.Suite({
  name: 'supposed-tests.manual'
})

const __projectdir = __dirname.split('tests.browser')[0]

// const reporters = (config) => {
//   try {
//     return config.reporters.map((reporter) => reporter.name).join(',') || 'list'
//   } catch (e) {
//     return 'tap'
//   }
// }
// stringifiedSuiteConfig: `{ reporter: '${reporters(suite.config)}', assertionLibrary: browserTestAssert }`,

module.exports = suite.runner({
  cwd: __projectdir,
  directories: ['./tests.browser'],
  title: 'supposed-browser-tests',
  port: 42002,
  stringifiedSuiteConfig: '{ name: "tests.browser", reporter: "event", assertionLibrary: browserTestAssert }',
  dependencies: ['/tests.browser/assert.js'],
  supposedPath: path.join(__projectdir, 'dist/supposed.js')
  // styles: 'body { color: #2eb815; }' // #b0c9dc
  // template: undefined,
  // page: undefined
}).startServer()
  .then(async (context) => {
    // console.log(context)
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    page.on('console', (msg) => {
      const txt = msg.text()

      try {
        const json = JSON.parse(txt)
        context.lastEvent = json
        suite.config.reporters.forEach((reporter) => reporter.write(json))
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(txt)
        context.lastEvent = txt
      }
    })
    await page.goto(`http://localhost:${context.runConfig.port}`, { waitUntil: 'networkidle2' })

    // await page.pdf({path: 'hn.pdf', format: 'A4'});

    await browser.close()

    return context
  })
