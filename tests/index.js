const fs = require('fs')
const path = require('path')
const walkSync = (d) => fs.statSync(d).isDirectory()
  ? fs.readdirSync(d).map(f => walkSync(path.join(d, f)))
  : d

walkSync('./tests')
  .filter(file => /specs\.js/.test(file))
  .forEach(file => {
    require(`../${file}`)
  })
