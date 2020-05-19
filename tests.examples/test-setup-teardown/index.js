const supposed = require('supposed')

supposed.Suite({
  givenSynonyms: ['given', 'setup'],
  whenSynonyms: ['when', 'teardown']
}).runner({
  cwd: __dirname
}).run()
