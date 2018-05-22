const fs = require('fs')
const path = require('path')
const fileNameExpression = /.(test(s?)\.js)|(spec(s?)\.js)$/i
const ignoreExpression = /node_modules/i
const walkSync = (dir) =>
  fs.readdirSync(dir).reduce((files, file) => {
    if (ignoreExpression.test(file)) {
      return files
    }

    const name = path.join(dir, file)
    const isDirectory = fs.statSync(name).isDirectory()
    return isDirectory ? [...files, ...walkSync(name)] : [...files, name]
  }, [])

walkSync('./tests')
  .filter(file => fileNameExpression.test(file))
  .forEach(file => {
    require(`../${file}`)
  })
