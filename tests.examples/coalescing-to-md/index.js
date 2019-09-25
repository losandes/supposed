const addToMd = (parts, md) => {
  if (!parts.length) {
    return
  }

  const part = parts.shift().trim()
  md[part] = md[part] || {}

  if (parts.length) {
    addToMd(parts, md[part])
  }
}

const space = '                                                               '

const toBullets = (md, layer) => {
  if (typeof layer === 'undefined') layer = 0
  let output = ''

  Object.keys(md).forEach((key) => {
    const line = key.replace(/\n/g, '\n' + space.substring(0, (layer + 1) * 2))
    output += space.substring(0, layer * 2) + `* ${line}\n`
    output += toBullets(md[key], layer + 1)
  })

  return output
}

const suite = require('supposed').configure({
  name: 'Mardown Test',
  reporters: 'noop'
})

suite.runner({ cwd: __dirname })
  .run()
  .then((context) => {
    const md = {}
    context.results.forEach((batch) => {
      batch.results.forEach((result) => {
        addToMd(result.behavior.split(','), md)
      })
    })

    console.log(`# ${suite.config.name}\n`)
    console.log(toBullets(md))
  })
