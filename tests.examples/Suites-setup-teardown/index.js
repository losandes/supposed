const supposed = require('supposed')

const setup = Promise.resolve({ some: 'dependencies' })
const teardown = (context) => { console.log(context) }

setup.then((dependencies) =>
  supposed.Suite({
    inject: dependencies
  }).runner({
    cwd: __dirname
  }).run()
).then(teardown)
