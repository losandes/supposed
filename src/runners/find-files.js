module.exports = {
  name: 'findFiles',
  factory: (dependencies) => {
    'use strict'

    const { fs, path } = dependencies

    const isString = (input) => typeof input === 'string' && input.trim().length

    function Config (config) {
      config = Object.assign({}, config)

      const self = {
        cwd: process.cwd(),
        directories: ['.'],
        matchesNamingConvention: /.([-.]test(s?)\.(js|cjs|mjs))|([-.]spec(s?)\.(js|cjs|mjs))$/i,
        matchesIgnoredConvention: /node_modules/i,
        injectSuite: true,
      }

      if (isString(config.cwd)) {
        self.cwd = config.cwd.trim()
      }

      if (
        Array.isArray(config.directories) &&
        config.directories.filter((input) => isString).length
      ) {
        self.directories = config.directories
          .filter((input) => isString)
          .map((input) => input.trim())
      }

      if (
        config.matchesNamingConvention &&
        typeof config.matchesNamingConvention.test === 'function'
      ) {
        self.matchesNamingConvention = config.matchesNamingConvention
      }

      if (
        config.matchesIgnoredConvention &&
        typeof config.matchesIgnoredConvention.test === 'function'
      ) {
        self.matchesIgnoredConvention = config.matchesIgnoredConvention
      }

      if (typeof config.injectSuite === 'boolean') {
        self.injectSuite = config.injectSuite
      }

      return Object.freeze(self)
    }

    function Walker (config) {
      function walkSync (dir) {
        return fs.readdirSync(dir).reduce((files, file) => {
          if (config.matchesIgnoredConvention.test(file)) {
            return files
          }

          const name = path.join(dir, file)
          const isDirectory = fs.statSync(name).isDirectory()
          return isDirectory ? [...files, ...walkSync(name)] : [...files, name]
        }, [])
      }

      return { walkSync }
    }

    function findFiles (options) {
      const config = new Config(options)
      const walker = new Walker(config)

      const paths = config.directories.reduce((testPaths, directory) => {
        let dirExists = false

        try {
          fs.statSync(directory)
          dirExists = true
        } catch (e) {}

        if (dirExists) {
          return testPaths.concat(walker.walkSync(path.join(config.cwd, directory))
            .filter(file => config.matchesNamingConvention.test(file)),
          )
        } else {
          return testPaths
        }
      }, [])

      // return a promise in case we decide to make the walker async
      return Promise.resolve({ runConfig: config, paths })
    }

    return { findFiles }
  },
}
