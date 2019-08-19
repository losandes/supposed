module.exports = {
  name: 'DefaultDiscoverer',
  factory: DefaultDiscoverer
}

function DefaultDiscoverer (fs, path) {
  function Config (config) {
    config = Object.assign({}, config)

    var self = {
      cwd: process.cwd(),
      directories: ['.'],
      matchesNamingConvention: /.([-.]test(s?)\.js)|([-.]spec(s?)\.js)$/i,
      matchesIgnoredConvention: /node_modules/i
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
      config.matchesIgnoredConvention &&
      typeof config.matchesIgnoredConvention.test === 'function'
    ) {
      self.matchesIgnoredConvention = config.matchesIgnoredConvention
    }

    if (config.suite && config.injectSuite !== false) {
      self.suite = config.suite
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

  const hasThen = (obj) => {
    return obj && typeof obj.then === 'function'
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

      const tests = paths.map(file => {
        var test = require(file)

        if (config.suite && typeof test === 'function') {
          const promise = test(config.suite)
          return hasThen(promise) ? promise : Promise.resolve(promise)
        }

        return Promise.resolve()
      })

      return Promise.all(tests)
        .then((results) => {
          return Object.freeze({
            results,
            config,
            files: paths,
            suite: config.suite
          })
        })
    }

    return { find, run }
  }
}
