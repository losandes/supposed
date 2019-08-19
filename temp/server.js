function start (testPaths) {
  const fs = require('fs')
  const http = require('http')
  const path = require('path')
  const port = 42001
  const _page = /* html */`
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  <title>polyn-blueprint-tests</title>
  </head>

  <body>
    <h1>Polyn Blueprint Tests</h1>
    <script src="/node_modules/chai/chai.js"></script>
    <script src="/dist/supposed.min.js"></script>
    <script>
      const module = { tests: [] }

      Object.defineProperty(module, 'exports', {
        get: function () {
          return null
        },
        set: function (val) {
          module.tests.push(val)
        },
        // this property should show up when this object's property names are enumerated
        enumerable: true,
        // this property may not be deleted
        configurable: false
      })
    </script>

    {{testPaths}}

    <script>
      (() => {
        const suite = supposed.Suite({
          reporter: supposed.reporters.tap,
          assertionLibrary: chai.expect
        })

        const tests = module.tests.map((test) => test(suite))

        Promise.all(tests)
          .then(() => {
            suite.printSummary(suite.getTotals())
            // console.log(suite.getTotals())
          })
      })()
    </script>
  </body>
  </html>
  `

  const DIR = __dirname.split('tests.browser')[0]

  let page

  if (Array.isArray(testPaths)) {
    const scripts = testPaths.map((testPath) => {
      return `<script src="${testPath}"></script>`
    })
    page = _page.replace(/{{testPaths}}/, scripts)
  } else {
    page = _page
  }

  const requestHandler = (request, response) => {
    if (request.url === '/' || request.url === '') {
      response.writeHead(200, {
        'Content-Type': 'text/html'
      })
      // response.setHeader('Content-Type', 'text/html')
      response.end(page)
      return
    }

    console.log(request.url)

    if (
      request.url.indexOf('node_modules') > -1 ||
      request.url.indexOf('dist') > -1 ||
      request.url.indexOf('tests') > -1 ||
      request.url.indexOf('tests.browser') > -1
    ) {
      const filePath = path.join(DIR, request.url)
      const stat = fs.statSync(filePath)

      response.writeHead(200, {
        'Content-Type': 'application/javascript',
        'Content-Length': stat.size
      })

      // response.setHeader('Content-Type', 'application/javascript')

      console.log(filePath)
      const readStream = fs.createReadStream(filePath)
      readStream.pipe(response)

      // readStream.on('open', () => readStream.pipe(response))
      readStream.on('error', (err) => response.end(err))
    } else {
      response.statusCode = 404
      response.statusMessage = 'Not Found'
      response.setHeader('Content-Type', 'text/html')
      response.end(`{ "ok": false }`)
    }
  }

  const server = http.createServer(requestHandler)

  server.listen(port, (err) => {
    if (err) {
      return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
  })
}

module.exports = { start }
