assay
=====
Assay is a simple, unopinionated, Promise friendly test runner for Node.js that runs tests concurrently, and provides BDD and TDD DSLs. It draws significant influence from vows, ava, and tape so it is partially compatible with each of their syntaxes.

Assay has several test runner options, and does not require a client (there is not a client at this time).

## This is an academic exploration, and is not maintained in any way that is fit for you to use on a project at this time.

## Adding assay to your project
assay isn't published yet. To use it, add it to your devDependencies in your package.json:

```
"assay": "git+https://github.com/losandes/assay.git",
```

## Test Syntax and Domain Service Languages (DSLs)
```JavaScript
var test = require('assay')

test('when dividing a number by zero, it should return Infinity', t => {
  t.equal(42 / 0, Infinity)
})
```

### The BDD DSL (Given, When, Then)
You can use BDD syntax to build your tests, separating the stages of a test into `given`, `when`, and as many assertions as you need:

```JavaScript
var test = require('assay')

test('when dividing a number by zero', {
  given: () => 42,
  when: (number) => { return number / 0 },
  'it should return Infinity': (then) => (err, actual) => {
    then.ifError(err)
    then.equal(actual, Infinity)
  },
  'if the number is zero': {
    given: () => 0,
    when: (number) => { return number / 0 },
    'it should return NaN': (then) => (err, actual) => {
      then.ifError(err)
      then.equal(isNaN(actual), true)
    },
    'it should not be equal to itself': (then) => (err, actual) => {
      then.ifError(err)
      then.notEqual(actual, actual)
    }
  }
})
```

### The TDD DSL (Arrange, Act, Assert)
You can also use Arrange, Act, Assert TDD syntax:

```JavaScript
var test = require('assay')

test('when dividing a number by zero', {
  arrange: () => 42,
  act: (number) => { return number / 0 },
  'it should return Infinity': (assert) => (err, actual) => {
    assert.ifError(err)
    assert.equal(actual, Infinity)
  },
  'if the number is zero': {
    arrange: () => 0,
    act: (number) => { return number / 0 },
    'it should return NaN': (assert) => (err, actual) => {
      assert.ifError(err)
      assert.equal(isNaN(actual), true)
    },
    'it should not be equal to itself': (assert) => (err, actual) => {
      assert.ifError(err)
      assert.notEqual(actual, actual)
    }
  }
})
```

### The Vows DSL (Topics)
If you like vows, and prefer `topics`, you can do that too.

> Note that while this DSL is similar to vows, vows tests are not fully compatible with assay.

```JavaScript
var test = require('assay')

test('when dividing a number by zero', {
  topic: () => { return 42 / 0 },
  'it should return Infinity': (assert) => (err, actual) => {
    assert.ifError(err)
    assert.equal(actual, Infinity)
  },
  'if the number is zero': {
    topic: (number) => { return 0 / 0 },
    'it should return NaN': (assert) => (err, actual) => {
      assert.ifError(err)
      assert.equal(isNaN(actual), true)
    },
    'it should not be equal to itself': (assert) => (err, actual) => {
      assert.ifError(err)
      assert.notEqual(actual, actual)
    }
  }
})
```

## Running Tests
assay does not require a client, so you can run them with node:

```Shell
$ node test/my-test.js
```

The following switches are supported:

* **-m**: run only tests that match the regular expression
* **--tap**, **-t**: use the TAP reporter
* **--brief**: use the brief reporter (errors and totals only)
* **--quiet**, **-q**: use the quiet reporter (no output to the console)
* **--quiet-tap**, **-qt**: use the quiet TAP reporter (no output to the console)
* **-r**: choose a reporter by name (TAP|BRIEF|QUIET|QUITE_TAP)

```Shell
$ node test/my-test.js -m foo --tap | tap-nyan
```

### TAP reporter
Assay supports the TAP format and thus is compatible with [any TAP reporter](https://github.com/sindresorhus/awesome-tap#reporters). Use the `--tap` flag to enable TAP output.

```Shell
$ node test/my-test --tap | tap-nyan
```

## Writing Tests

### Promise Support
Each test function can run asyncronously by returning a `Promise`:

```JavaScript
test('when dividing a number by zero', {
  given: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(42)
      }, 0)
    })
  },
  when: (number) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(number / 0)
      }, 0)
    })
  },
  'it should return Infinity': (then) => (err, actual) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // some async process
        resolve()
      }, 0)
    }).then(result => {
      then.ifError(err)
      then.equal(actual, Infinity)
    })
  }
})
```

> NOTE that assertions that are made asynchronously cannot be caught, so you need to catch them and reject in order for the output to be consumed, or simply move the assertions into a then block, as in the example above.

### Async Support
Each test function can run asyncronously by using `async/await`:

```JavaScript
test('when dividing a number by zero', {
  given: async () => {
    const actual = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(42)
      }, 0)
    })

    return actual
  },
  when: async (number) => {
    const actual = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(number / 0)
      }, 0)
    })

    return actual
  },
  'it should return Infinity': (then) => async (err, actual) => {
    then.ifError(err)
    then.equal(actual, Infinity)
  }
})
```

or:
```JavaScript
test('divide by zero equals infinity', async t => {
  const actual = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(42 / 0)
    }, 0)
  })

  t.equal(actual, Infinity)
})
```

### Running Tests Serially
Sometimes we need our tests to run in a specific order. Since assay returns a promise, we can chain tests together using Promise control flow:

```JavaScript
const insertSpec = () => test('when a user is inserted into the database', t => {
  t.ok(true)
})

const updateSpec = () => test('when that user is updated', t => {
  t.ok(true)
})

insertSpec()
  .then(updateSpec())
```

### Skipping Tests
There are three ways to skip a tests:

* Start the test description with comments: `// `
* Start the test description with a TAP SKIP directive: `# SKIP `
* Start the test description with a TAP TODO directive: `# TODO `

> Note that skip and todo are not case sensitive, that all three options must be followed by a space, and that all three options must be at the beginning of the description.

```JavaScript
test('// when dividing a number by zero, it should return Infinity', t => {
  t.equal(42 / 0, Infinity)
})
```

If you nest your tests, you can skip any level. All children of a skipped level are also skipped. The following example will skip all tests:

```JavaScript
test('// when dividing a number by zero', {
  'it should return Infinity': (t) => {
    t.equal(42 / 0, Infinity)
  },
  'if the number is zero': {
    'it should return NaN': (t) => {
      t.equal(isNaN(0 / 0), true)
    },
    'it should not be equal to itself': (t) => {
      t.notEqual(0 / 0, 0 / 0)
    }
  }
})
```

And this one will just skip two of the tests:

```JavaScript
test('when dividing a number by zero', {
  'it should return Infinity': (t) => {
    t.equal(42 / 0, Infinity)
  },
  'if the number is zero': {
    '# SKIP it should return NaN': (t) => {
      t.equal(isNaN(0 / 0), true)
    },
    '# TODO it should not be equal to itself': (t) => {
      t.notEqual(0 / 0, 0 / 0)
    }
  }
})
```

> NOTE that when a test is skipped, or when all of a tests' assertions are skipped, the `given|arrange` and `when|act|topic` functions will not be executed

### Nest Inheritance
Assay lets you nest your tests, to branch paths and assertions, in a similar way to how vows works. Nodes in a nest inherit the `given|arrange`, and `when|act|topic` from parent nodes, if they don't define these properties.

In the following example, `given` returns a function that is used by all tests in the nest:

```JavaScript
test('when dividing a number by zero', {
  given: () => {
    return (number) => { return number / 0 }
  },
  when: (divideByZero) => { return divideByZero(42) },
  'it should return Infinity': (then) => (err, actual) => {
    then.ifError(err)
    then.equal(actual, Infinity)
  },
  'if the number is zero': {
    when: (divideByZero) => { return divideByZero(0) },
    'it should return NaN': (then) => (err, actual) => {
      then.ifError(err)
      then.equal(isNaN(actual), true)
    },
    'it should not be equal to itself': (then) => (err, actual) => {
      then.ifError(err)
      then.notEqual(actual, actual)
    }
  }
})
```

## Configuring Tests
Assay allows configuration at two levels: suite level, and test level. The folliwng configurations are supported:

### Suite Configuration

* **timeout** {number} (default is 2000ms) : The amount of time that assay waits, before it cancels a long-running test
* **assertionLibrary** {object} (default is `assert`) : The assertion library that will be passed to the tests
* **reporter** {string or object} (default is "DEFAULT") : The reporter to use for test output (DEFAULT|TAP|BRIEF|QUIET|QUIET_TAP|or a custom reporter)

```JavaScript
const events = []
const test = require('assay').Suite({
  timeout: 10000, // 10 seconds
  assertionLibrary: require('chai').expect,
  reporter: {
    reporter: {
      report: function (event) {
        // each test produces an event
        events.push(event)
      },
      getTotals: () => {
        return {
          total: 0,
          passed: 0,
          skipped: 0,
          failed: 0,
          broken: 0,
          startTime: new Date(),
          endTime: new Date()
        }
      },
      getResults: () => {
        // an array of all of the test events
        return events
      }
    }
  }
})

test('when dividing a number by zero, it should return Infinity', t => {
  t.equal(42 / 0, Infinity)
})
```

### Test Configuration

* **timeout** {number} (default is 2000ms) : The amount of time that assay waits, before it cancels a long-running test
* **assertionLibrary** {object} (default is `assert`) : The assertion library that will be passed to the tests

```JavaScript
const expect = require('chai').expect

test('when dividing a number by zero', {
  timeout: 10000, // 10 seconds
  assertionLibrary: expect,
  when: () => {
    return 42 / 0
  },
  'it should return Infinity': expect => (err, actual) => {
    expect(err).to.equal(null)
    expect(actual).to.equal(Infinity)
  }
})
```

> NOTE that test configurations behave the same as everything else with respect to nest inerhitance (i.e. the timeout can be set at the top of a tree and used for all tests that don't override it)