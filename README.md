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

### Given, When, Then
You can use BDD syntax to build your tests, separating the stages of a test into `given`, `when`, and as many assertions as you need:

```JavaScript
var test = require('assay')

test('my subject', {
  given: () => {
    // arrange / set up
    return 42
  },
  when: (given) => {
    // act / execute behavior
    return given / 0
  },
  'it should run `given`, `when`, and then the assertions':
    (then) => (err, actual) => {
      then.ifError(err)
      then.equal(actual, 42)
    }
})
```

### Arrange, Act, Assert

```JavaScript
var test = require('assay')

test('my subject', {
  arrange: () => {
    // given / arrange / set up
    return 42
  },
  act: (arranged) => {
    // act / execute behavior
    return arranged
  },
  'it should run `arrange`, `when`, and then the assertions':
    (assert) => (err, actual) => {
      assert.ifError(err)
      assert.equal(actual, 42)
    }
})
```
