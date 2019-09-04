module.exports = {
  name: 'find-files',
  factory: (dependencies) => {
    'use strict'

    const { fs, path, makeDebugger } = dependencies
    const debug = makeDebugger().withSource('find-files')

    const isString = (input) => typeof input === 'string' && input.trim().length

    function Config (config) {
      config = Object.assign({}, config)

      const self = {
        cwd: process.cwd(),
        directories: ['.'],
        matchesNamingConvention: /.([-.]test(s?)\.js)|([-.]spec(s?)\.js)$/i,
        matchesIgnoredConvention: /node_modules/i
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

      return { walkSync: walkSync }
    }

    function findFiles (options) {
      const config = debug(new Config(options))
      const walker = new Walker(config)

      const paths = config.directories.reduce((testPaths, directory) => {
        return testPaths.concat(walker.walkSync(path.join(config.cwd, directory))
          .filter(file => config.matchesNamingConvention.test(file))
        )
      }, [])

      // return a promise in case we decide to make the walker async
      return Promise.resolve(debug(paths))
    }

    return { findFiles }
  }
}
