assay
=====
Assay is a simple, unopinionated test runner for Node.js that runs tests concurrently.

## This is an academic exploration, and is not maintained in any way that is fit for you to use on a project at this time.

## Adding assay to your project
assay isn't published yet. To use it, add it to your devDependencies in your package.json:

```
"assay": "git+https://github.com/losandes/assay.git",
```

## Test Syntax
```JavaScript
var test = require('assay')

test('when something happens', t => {
  t.equal(42, 42)
})
```
