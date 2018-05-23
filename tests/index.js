const supposed = require('../index.js')

supposed.runner({
  matchesIgnoredConvention: /discoverer-meta-specs|node_modules/i
}).run()
// .then((context) => {
//   console.log(context.files)
// })
