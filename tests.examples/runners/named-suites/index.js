const { expect } = require('chai')
const supposed = require('supposed')

supposed.Suite({
  name: 'supposed-tests.docs',
  inject: { expect }
})
  .runner({ cwd: __dirname })
  .run()
