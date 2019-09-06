const fs = require('fs')
const http = require('http')
const path = require('path')

module.exports = {
  name: 'runServer',
  factory: () => {
    'use strict'

    const isString = (input) => typeof input === 'string' && input.trim().length

    function Config (config) {
      config = Object.assign({}, config)

      const self = {
        cwd: process.cwd(),
        title: 'supposed',
        port: 42001,
        dependencies: [],
        supposed: fs.readFileSync(path.join(__dirname.split('/src/discovery')[0], 'dist/supposed.min.js'))
          .toString(),
        template: undefined,
        stringifiedSuiteConfig: ''
      }

      if (isString(config.cwd)) {
        self.cwd = config.cwd.trim()
      }

      if (isString(config.title)) {
        self.title = config.title.trim()
      }

      if (typeof config.port === 'number' && config.port > 0) {
        self.port = config.port
      }

      if (Array.isArray(config.dependencies)) {
        config.dependencies.forEach((dependency) => {
          if (isString(dependency)) {
            self.dependencies.push(dependency)
          }
        })
      }

      if (isString(config.supposedPath)) {
        self.supposedPath = config.supposedPath.trim()
      }

      if (isString(config.stringifiedSuiteConfig)) {
        self.stringifiedSuiteConfig = config.stringifiedSuiteConfig.trim()
      }

      if (isString(config.template)) {
        self.template = config.template.split('// {{TEST_MODULES}}')
      } else if (Array.isArray(config.template)) {
        self.template = config.template
      } else {
        self.template = fs.readFileSync(path.join(__dirname, 'test-browser-template.js'))
          .toString()
          .split('// {{TEST_MODULES}}')
      }

      return Object.freeze(self)
    }

    const makeTestBundle = ({ paths, template, stringifiedSuiteConfig }) => {
      const beginning = template[0]
      const end = template[1]
      const modules = [beginning]
      paths.forEach((file) => modules.push(fs.readFileSync(file).toString()))
      modules.push(end.replace('/*{{suiteConfig}}*/', stringifiedSuiteConfig))

      return modules.join('\n\n')
    }

    const makeRequestHandler = ({ page, cwd }) => (request, response) => {
      if (request.url === '/' || request.url === '') {
        response.writeHead(200, {
          'Content-Type': 'text/html'
        })
        response.end(page)
        return
      }

      const filePath = path.join(cwd, request.url)
      const exists = fs.existsSync(filePath)

      if (exists) {
        const stat = fs.statSync(filePath)

        response.writeHead(200, {
          'Content-Type': 'application/javascript',
          'Content-Length': stat.size
        })

        const readStream = fs.createReadStream(filePath)
        readStream.pipe(response)

        // readStream.on('open', () => readStream.pipe(response))
        readStream.on('error', (err) => response.end(err))
      } else {
        response.statusCode = 404
        response.statusMessage = 'Not Found'
        response.setHeader('Content-Type', 'text/html')
        response.end('{ "ok": false }')
      }
    }

    function start ({ title, dependencies, testBundle, port = 42001, supposed, cwd = process.cwd() }) {
      const scripts = dependencies.map((filePath) => `<script src="${filePath}"></script>\n`)
      const server = http.createServer(makeRequestHandler({
        cwd,
        page: /* html */`
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
      body { font-family: "Courier New", Courier, monospace; }
      .supposed_summary { font-size: 1.2em; margin-bottom: 20px; }
      .supposed_summary_item { margin-right: 20px; }
      .supposed_summary_item.supposed_color_passed { color: #4c8000; }
      .supposed_summary_item.supposed_color_failed { color: #c52b20; }
      .supposed_summary_item.supposed_color_skipped { color: #804c00; }
      .supposed_summary_item.supposed_color_info { color: #185c92; }
      .supposed_test { margin-top: 10px; }
      .supposed_behavior { padding-left: 10px; }
      .supposed_icon.supposed_color_passed { display: block; background-color: #4c8000; color: #ffffff; padding: 0 5px; }
      .supposed_icon.supposed_color_failed { display: block; background-color: #c52b20; color: #ffffff; padding: 0 5px; }
      .supposed_icon.supposed_color_skipped { display: block; background-color: #804c00; color: #ffffff; padding: 0 5px; }
      .supposed_icon.supposed_color_info { display: block; background-color: #185c92; color: #ffffff; padding: 0 5px; }
    </style>
    </head>
    <body>
      <h1>${title}</h1>
      <script>
      ${supposed}
      </script>
      ${scripts}
      <script>
      ${testBundle}
      </script>
    </body>
    </html>`
      }))

      server.listen(port, (err) => {
        if (err) {
          return console.log('something bad happened', err)
        }

        console.log(`server is listening on ${port}`)
      })

      return server
    }

    const runServer = (suite, serverConfig) => (context) => {
      const { paths } = context
      const _serverConfig = new Config(serverConfig)

      if (!paths) {
        throw new Error('run-server expects paths to the tests to be provided')
      }

      return start({
        title: _serverConfig.title,
        dependencies: _serverConfig.dependencies,
        testBundle: makeTestBundle({
          paths,
          template: _serverConfig.template,
          stringifiedSuiteConfig: _serverConfig.stringifiedSuiteConfig
        }),
        port: _serverConfig.port,
        cwd: _serverConfig.cwd,
        supposed: _serverConfig.supposed
      })
    }

    return { runServer }
  } // /factory
} // /module
