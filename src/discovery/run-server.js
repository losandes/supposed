const fs = require('fs')
const http = require('http')
const path = require('path')

module.exports = {
  name: 'runServer',
  factory: () => {
    'use strict'

    const isString = (input) => typeof input === 'string' && input.trim().length
    const makeTestBundle = ({ paths, template, stringifiedSuiteConfig }) => {
      const beginning = template[0]
      const end = template[1]
      const modules = [beginning]
      paths.forEach((file) => modules.push(fs.readFileSync(file).toString()))
      modules.push(end.replace(/\/\*{{suiteConfig}}\*\//, stringifiedSuiteConfig))

      return modules.join('\n\n')
    }

    function Config (config, paths, suite) {
      config = Object.assign({}, config)

      const self = {
        cwd: suite.config.cwd,
        title: 'supposed',
        port: 42001,
        dependencies: [],
        scripts: [],
        styles: '',
        supposed: undefined,
        template: undefined,
        stringifiedSuiteConfig: `{ reporter: '${suite.config.reporter || 'default'}'}`,
        page: undefined
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

      if (Array.isArray(config.scripts)) {
        config.scripts.forEach((dependency) => {
          if (isString(dependency)) {
            self.scripts.push(dependency)
          }
        })
      }

      if (isString(config.styles)) {
        self.styles = config.styles
      }

      if (isString(config.supposedPath)) {
        self.supposed = fs.readFileSync(config.supposedPath).toString()
      } else {
        self.supposed = fs.readFileSync(
          path.join(__dirname.split('/src/discovery')[0], 'dist/supposed.min.js')
        ).toString()
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

      if (isString(config.page)) {
        self.page = config.page
      } else {
        self.testBundle = makeTestBundle({
          paths,
          template: self.template,
          stringifiedSuiteConfig: self.stringifiedSuiteConfig
        })
        const scriptTags = self.dependencies.map((filePath) => `<script src="${filePath}"></script>`)
        self.page = /* html */`
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <title>${self.title}</title>
    <style>
      body { font-family: monospace, "Courier New", Courier; }
      .supposed_summary { font-size: 1.2em; margin-bottom: 20px; }
      .supposed_summary_item { margin-right: 20px; }
      .supposed_summary_item.supposed_color_passed { color: #4c8000; }
      .supposed_summary_item.supposed_color_failed { color: #c52b20; }
      .supposed_summary_item.supposed_color_skipped { color: #804c00; }
      .supposed_summary_item.supposed_color_info { color: #185c92; }
      ${self.styles}
    </style>
    </head>
    <body>
      <h1>${self.title}</h1>
      <script>
      ${self.supposed}
      </script>
      ${scriptTags.join('\n')}
      <script>
      ${self.scripts.join('\n\n')}
      </script>
      <script>
      ${self.testBundle}
      </script>
    </body>
    </html>`
      }

      return Object.freeze(self)
    }

    const makeRequestHandler = ({ page, cwd, makeConfig }) => (request, response) => {
      let _isRefresh = false

      if (request.url === '/' || request.url === '') {
        let _page

        if (_isRefresh) {
          _page = makeConfig().page
        }

        response.writeHead(200, {
          'Content-Type': 'text/html'
        })
        response.end(_page || page)
        _isRefresh = true
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

    function start (makeConfig) {
      const { port = 42001, page, cwd = process.cwd() } = makeConfig()
      const server = http.createServer(makeRequestHandler({ cwd, page, makeConfig }))

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

      if (!paths) {
        throw new Error('run-server expects paths to the tests to be provided')
      }

      return start(() => {
        const _serverConfig = new Config(serverConfig, paths, suite)

        return {
          title: _serverConfig.title,
          dependencies: _serverConfig.dependencies,
          scripts: _serverConfig.scripts,
          styles: _serverConfig.styles,
          testBundle: _serverConfig.testBundle,
          port: _serverConfig.port,
          page: _serverConfig.page,
          cwd: _serverConfig.cwd,
          supposed: _serverConfig.supposed
        }
      })
    }

    return { runServer }
  } // /factory
} // /module
