module.exports = {
  name: 'reporterFactory',
  factory: () => {
    'use strict'

    function ReporterFactory () {
      const self = {}
      const map = {}

      const uppered = (name) => {
        return typeof name === 'string' ? name.trim().toUpperCase() : undefined
      }

      self.get = (name) => {
        const _name = uppered(name)

        if (!map[_name]) {
          throw new Error(`A reporter by name, "${name}", is not registered`)
        }

        const reporter = new map[_name]()
        reporter.name = reporter.name || _name
        return reporter
      }

      self.add = (reporter) => {
        if (typeof reporter !== 'function') {
          throw new Error(`Invalid Reporter: expected reporter {${typeof reporter}} to be a {function}`)
        }
        const errors = []

        if (typeof reporter.name !== 'string' || reporter.name.trim().length < 1) {
          errors.push(`Invalid Reporter: expected reporter.name {${typeof reporter.name}} to be a non-empty {string}`)
        }

        const { write } = reporter()

        if (typeof write !== 'function') {
          errors.push(`Invalid Reporter: expected reporter().write {${typeof write}} to be a {function}`)
        }

        if (errors.length) {
          throw new Error(errors.join(', '))
        }

        const name = uppered(reporter.name)
        map[name] = reporter

        if (name.indexOf('REPORTER')) {
          const shortName = name.substring(0, name.indexOf('REPORTER'))
          map[shortName] = reporter
        }

        return self
      }

      return self
    }

    return { ReporterFactory }
  }
}
