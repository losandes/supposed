module.exports = function (fs, path) {
  function Config (config) {
    config = Object.assign({}, config)

    var self = {
      cwd: process.cwd(),
      directories: ['.'],
      matchesNamingConvention: /.([-.]test(s?)\.js)|([-.]spec(s?)\.js)$/i,
      matchesIgnoredDirectory: /node_modules/i
    }

    if (typeof config.cwd === 'string') {
      self.cwd = config.cwd
    }

    if (
      Array.isArray(config.directories) &&
      config.directories.filter((input) => typeof input === 'string').length
    ) {
      self.directories = config.directories
        .filter((input) => typeof input === 'string')
    }

    if (
      config.matchesNamingConvention &&
      typeof config.matchesNamingConvention.test === 'function'
    ) {
      self.matchesNamingConvention = config.matchesNamingConvention
    }

    if (
      config.matchesIgnoredDirectory &&
      typeof config.matchesIgnoredDirectory.test === 'function'
    ) {
      self.matchesIgnoredDirectory = config.matchesIgnoredDirectory
    }

    if (config.suite && config.injectSuite !== false) {
      self.suite = config.suite
    }

    return Object.freeze(self)
  }

  function Walker (config) {
    function walkSync (dir) {
      return fs.readdirSync(dir).reduce((files, file) => {
        if (config.matchesIgnoredDirectory.test(file)) {
          return files
        }

        const name = path.join(dir, file)
        const isDirectory = fs.statSync(name).isDirectory()
        return isDirectory ? [...files, ...walkSync(name)] : [...files, name]
      }, [])
    }

    return { walkSync: walkSync }
  }

  return function (options) {
    let config = new Config(options)

    function find (findOptions) {
      if (findOptions) {
        config = new Config(Object.assign(findOptions, options))
      }

      const walker = new Walker(config)

      return Promise.resolve(
        config.directories.reduce((testPaths, directory) => {
          return testPaths.concat(walker.walkSync(path.join(config.cwd, directory))
            .filter(file => config.matchesNamingConvention.test(file))
          )
        }, [])
      )
    }

    const run = (paths) => {
      if (!paths) {
        return find().then(run)
      }

      return paths.forEach(file => {
        var test = require(file)

        if (config.suite && typeof test === 'function') {
          test(config.suite)
        }
      })
    }

    return { find, run }
  }
}
