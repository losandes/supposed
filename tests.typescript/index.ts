import { expect } from 'chai'
import * as supposed from '..'

supposed.Suite({
  name: 'supposed-tests.typescript',
  assertionLibrary: expect
}).runner({
  cwd: __dirname
}).run()
// .then((context) => console.log(context))
