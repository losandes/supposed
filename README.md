Supposed
========
_Supposed_ is a simple test runner for Node.js, TypeScript, and the Browser that:

* Is Promise-friendly
* Is async-await friendly
* Runs tests concurrently
* Provides BDD, TDD, and xunit Domain Service Languages (DSLs)
* Supports test discovery, and execution
* Has many reporter (test output) options: concise (default - like mocha, but without nesting), TAP, JSON, nyan cat, block (jest style), brief (summary and errors only), array (no output, but test output is available on reporter output), noop (can be useful with pubsub (see below)), custom (supply your own easily)
* Supports pubsub - you can subscribe to the events to write your own reporter, or stream test output to a file or other services
* Can run in the terminal/console
* Can start a server for browser testing
* Can easily be used to pipe browser test output into the terminal
* Does not require a client (simple, functional, async JS/TS config)
* Supports suite injection, with a composition root
* Draws significant influence from vows, ava, and tape so it is partially compatible with some of their syntaxes
* Will work with mocha's `describe`, `it` syntax with a little bit of test refactoring (`before` and `after` aren't supported, though - this library uses async-await, `then`, BDD, or TDD syntax to support setup and tear down)
* Has 0 dependencies (not counting dev-dependencies)

* [Getting Started with Node](#node)
* [Getting Started with the Browser](#browser)
* [Test Syntax and Domain Service Languages (DSLs)](#test-syntax-and-domain-service-languages-dsls))
  * [The BDD DSL (Given, When, Then)](#the-bdd-dsl-given-when-then)
  * [The AAA DSL (Arrange, Act, Assert)](#the-aaa-dsl-arrange-act-assert)
  * [The xunit DSL (atomic)](#the-xunit-dsl-atomic)
* [Discovering Tests and Running Them](#discovering-tests-and-running-them)
  * [Configuring the Runner](#configuring-the-runner)
  * [Configuring the Browser Test Server](#configuring-the-browser-test-server)
* [Suite Configuration](#suite-configuration)
* [Test Configuration](#test-configuration)
* [TypeScript Support](#typescript-support)
* [Why Supposed](#why-supposed)
* [Cookbook](#cookbook)
  * [Global Setup and Teardown](#global-setup-and-teardown)
  * [Test Setup and Teardown](#test-setup-and-teardown)
  * [Injecting Dependencies](#injecting-dependencies)
  * [Naming Suites](#naming-suites)
  * [Running Multiple Suites](#running-multiple-suites)
  * [Using Promises in Tests](#using-promises-in-tests)
  * [Using async-await in Tests](#using-async---await-in-tests)
  * [Running Tests Serially](#running-tests-serially)
  * [Writing a Test Reporter](#writing-a-test-reporter)
  * [Adding Information to Report Output (event.log)](#adding-information-to-report-output-event.log)
  * [Adding Context to Test Events (event.context)](#adding-context-to-test-events-event.context)
  * [Skipping Tests](#skipping-tests)
  * [Marking Tests as TODO](#marking-tests-as-todo)
  * [Running Specific Tests (only)](#running-specific-tests-only)
  * [Piping Browser Test Output to the Terminal](#piping-browser-test-output-to-the-terminal)
  * [Nest/Branch Inheritance](#nest-branch-inheritance)
  * [Streaming Output to a File](#streaming-output-to-a-file)
  * [Roll Your Own Browser Template](#roll-your-own-browser-template)

## Getting Started With Node

## Getting Started With the Browser



## Adding Supposed to your project

```Shell
npm install --save-dev supposed
```

## Test Syntax and Domain Service Languages (DSLs)

### The BDD DSL (Given, When, Then)
You can use BDD syntax to build your tests, separating the stages of a test into `given`, `when`, and as many assertions as you need:

```JavaScript
var test = require('supposed')

test('when dividing a number by zero', {
  given: () => 42,
  when: (number) => { return number / 0 },
  'it should return Infinity': (then) => (err, actual) => {
    then.ifError(err)
    then.strictEqual(actual, Infinity)
  },
  'if the number is zero': {
    given: () => 0,
    when: (number) => { return number / 0 },
    'it should return NaN': (then) => (err, actual) => {
      then.ifError(err)
      then.strictEqual(isNaN(actual), true)
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
var test = require('supposed')

test('when dividing a number by zero', {
  arrange: () => 42,
  act: (number) => { return number / 0 },
  'it should return Infinity': (assert) => (err, actual) => {
    assert.ifError(err)
    assert.strictEqual(actual, Infinity)
  },
  'if the number is zero': {
    arrange: () => 0,
    act: (number) => { return number / 0 },
    'it should return NaN': (assert) => (err, actual) => {
      assert.ifError(err)
      assert.strictEqual(isNaN(actual), true)
    },
    'it should not be equal to itself': (assert) => (err, actual) => {
      assert.ifError(err)
      assert.notEqual(actual, actual)
    }
  }
})
```

### The xunit DSL (atomic)
If you prefer the atomic nature of xunit, it is not necessary to leverage the BDD and TDD features:

```JavaScript
var test = require('supposed')

test('when dividing a number by zero, it should return Infinity', (t) => {
  t.strictEqual(42 / 0, Infinity)
})
```

## Running Tests
_Supposed_ does not require a client. You can run tests with node:

```Shell
$ node test/my-test.js
```

The following switches are supported:

* **-m**: run only tests that match the regular expression
* **-r**: choose a reporter by name (`tap|json|nyan|brief|array|quiet|block|justthedescriptions|noop`)

```Shell
$ npm install --save-dev tap-spec
$ node tests -m foo -r tap | npx tap-parser -j | jq
```

> In that example, we run tests that have the word "foo" in their descriptions, using TAP output, and pipe the output of the tests into another package, [tap-parser](https://www.npmjs.com/package/tap-parser), and then pipe the output of that package into [jq](https://stedolan.github.io/jq/)

### Test Discovery & the Runner
As you can see above, it's not necessary to write, or use a runner. A bear bones test suite might simply `require`, or `import` each test file. However that produces multiple result summaries which can be hard to parse or understand.

Using a runner, Supposed will group the tests into batches, and summarize the outcomes in a single report. In the following example, we see 2 test files, and a test runner file.

```JavaScript
// ./first-module/first-spec.js
const test = require('supposed')

module.exports = test('given first-module, when... it...', (t) => {
  t.strictEqual(42 / 0, Infinity)
})

// ./second-module/second-spec.js
const test = require('supposed')

module.exports = test('given second-module, when... it...', (t) => {
  t.strictEqual(42 / 0, Infinity)
})

// ./tests.js
module.exports = require('supposed')
  .configure({ name: 'foo', inject: { foo: 'bar' } }) // optional
  .runner()
  .run()
```

We can execute this, using node:

```Shell
$ node tests
```

#### Configuring the Runner
The runner can be configured to look in specific directories, ignore others, and to match the naming conventions of your choice.

* **cwd** (String) (default: `process.cwd()`): The current working directory that the file-tree walker should start from
* **directories** (Array) (default: `['.']`): You can specify an array of directories to include if you want. By default, it will recurse through every folder in the current working directory (cwd).
* **matchesNamingConvention** (RegExp|Object) (default: `/.([-.]test(s?)\.js)|([-.]spec(s?)\.js)$/i`): The naming convention for your test files. When you define this as an object, the object must have a `test` function that returns a boolean. By default it will match any file that ends in `-test.js`, `.test.js`, `-tests.js`, `.tests.js`, `-spec.js`, `.spec.js`, `-specs.js`, or `.specs.js`. It will _not_ match `test.js`, `tests.js`, `spec.js`, nor `specs.js`, so these names are safe for defining your runner(s).
* **matchesIgnoredConvention** (RegExp|Object) (default: `/node_modules/i`): A convention used to ignore directories, or files. When you define this as an object, the object must have a `test` function that returns a boolean. By default, the `node_modules` directory will be ignored. If you override this, you have to ignore that directory as well, unless you want it to run tests in your node_modules directory.
* **injectSuite** (Boolean) (default: true): If your module exports a function that isn't a reference to supposed, supposed will try to inject itself into that function. If you don't want supposed to do that, set this to false

```JavaScript
const supposed = require('supposed')
const path = require('path')
const runner = supposed.runner({
  cwd: path.join(process.cwd(), 'tests'),
  directories: ['./contracts', './repositories'],
  matchesNamingConvention: /.(-custom\.js)$/i,
  matchesIgnoredConvention: /node_modules/i,
  injectSuite: true
})
```

> Note that with the default configuration, the runner will walk all of the folders from the root of your project, except for `node_modules`.

Both `matchesNamingConvention`, and `matchesIgnoredConvention` can be regular expressions (above), or objects that match the following interface:

```TypeScript
interface {
  test (filePath: string): boolean;
}
```

```JavaScript
const supposed = require('supposed')
const runner = supposed.runner({
  matchesNamingConvention: {
    test: function (filePath) {
      return input.indexOf('test') > -1
    }
  }
})
```

#### Injecting dependencies
The file where you configure your runner is a composition root, which can be used to share dependencies across tests. You might use this to pass around a composed System Under Test (SUT), additional assertion libraries, ENVVARS, etc.

> NOTE that doing this will make your tests unable to run when called directly (i.e. `node ./first-module/first-spec.js`), so there are benefits and drawbacks. You can alway use `-m` to single out which tests get execute by the runner, though.

```JavaScript
// ./first-module/first-spec.js
const test = require('supposed')
const { expect } = test.dependencies

module.exports = test('given first-module, when... it...', (t) => {
  expect(42 / 0).to.equal(Infinity)
})

// ./second-module/second-spec.js
const test = require('supposed')

module.exports = test('given second-module, when... it...', (t) => {
  t.strictEqual(42 / 0, Infinity)
})

// ./tests.js
const { expect } = require('chai')
module.exports = require('supposed')
  .configure({
    name: 'foo',
    inject: {
      expect,
      env: process.env,
      argv: process.argv
    } }) // optional
  .runner()
  .run()
```

##### Global Setup and Teardown
The runner returns a Promise, which returns the context: the results of each test file, the test file paths, the configuration that was used to execute the tests, and the suite. If you want to run an operation (i.e. teardown) after all tests pass, your tests have to both accept suite injection, and return a promise that resolves after all assertions in that file are complete. This can be accomplished by nesting all of your tests under one grouping, and returning that (e.g. like _describe_ in mocha, jasmine, etc.).

> Also see [Setup and Teardown](#setup-and-teardown)

```JavaScript
// ./first-module/first-spec.js
module.exports = (describe) => {
  return describe('first-module', {
    'when... it...': expect => {
      expect(42 / 0).to.equal(Infinity)
    })
  })
}

// ./second-module/second-spec.js
module.exports = (describe) => {
  return describe('second-module', {
    'when... it...': expect => {
      expect(42 / 0).to.equal(Infinity)
    })
  })
}

// ./tests.js
const test = require('supposed')

test.runner()
  .run()
  .then((context) => {
    console.log(`The following files were executed: ${context.files.join(',')}`)
  })
```

> NOTE if any of your test files don't return a promise, or resolve a promise before they are complete, `then` will execute before your tests finish running. It will still have the

#### Writing Your Own Test Runner
If you want to roll your own, perhaps to perform some custom test injection, here's a simple example:

```JavaScript
const fs = require('fs')
const path = require('path')
const fileNameExpression = /.([-.]test(s?)\.js)|([-.]spec(s?)\.js)$/i
const ignoreExpression = /node_modules/i
const walkSync = (dir) =>
  fs.readdirSync(dir).reduce((files, file) => {
    if (ignoreExpression.test(file)) {
      return files
    }

    const name = path.join(dir, file)
    const isDirectory = fs.statSync(name).isDirectory()
    return isDirectory ? [...files, ...walkSync(name)] : [...files, name]
  }, [])

walkSync('.')
  .filter(file => fileNameExpression.test(file))
  .forEach(file => {
    require(`../${file}`)
  })
```

#### Programmatic Report Consumption
If you're using this as part of continuous integration, and you don't want the output to be written to `stdout`, you can use the `-q` switch and programmatically handle the results:

```JavaScript
const suite = require('supposed').Suite()

suite.runner().run().then((context) => {
  // do something with the results here
  console.log(context.results)
})
```

### TAP reporter
Supposed supports the TAP format and thus is compatible with [any TAP reporter](https://github.com/sindresorhus/awesome-tap#reporters). Use the `--tap` flag to enable TAP output.

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
      then.strictEqual(actual, Infinity)
    })
  }
})
```

or:
```JavaScript
test('divide by zero equals infinity', t => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(42 / 0)
    }, 0)
  }).then(actual => {
    t.strictEqual(actual, Infinity)
  })
})
```

> NOTE that assertions that are made asynchronously cannot be caught, so you need to catch them and reject in order for the output to be consumed, or simply move the assertions into a then block, as in the examples above.

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
    then.strictEqual(actual, Infinity)
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

  t.strictEqual(actual, Infinity)
})
```

### Running Tests Serially
Sometimes we need our tests to run in a specific order. Since _Supposed_ returns a promise, we can chain tests together using Promise control flow:

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

### Setup and Teardown
If you want/need to setup services before running your tests, and then tear them down afterwards, run the tests in a Promise chain, and make sure to return the `test`.

> Also see [Global Setup and Teardown](#global-setup-and-teardown)

```JavaScript
const setup = new Promise((resolve, reject) => {
  setTimeout(() => {
    // prepare for running the tests
    resolve()
  }, 0)
})

const teardown = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    // tear down your setup
    resolve()
  }, 0)
})

setup.then(() => {
  return test('divide by zero equals infinity', t => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(42 / 0)
      }, 0)
    }).then(actual => {
      t.strictEqual(actual, Infinity)
    })
  })
}).then(() => {
  teardown()
})
```

### Skipping Tests
There are three ways to skip a tests:

* Start the test description with comments: `// `
* Start the test description with a TAP SKIP directive: `# SKIP `
* Start the test description with a TAP TODO directive: `# TODO `

> Note that skip and todo are not case sensitive, that all three options must be followed by a space, and that all three options must be at the beginning of the description.

```JavaScript
test('// when dividing a number by zero, it should return Infinity', t => {
  t.strictEqual(42 / 0, Infinity)
})
```

If you nest/branch your tests, you can skip any level. All children of a skipped level are also skipped. The following example will skip all tests:

```JavaScript
test('// when dividing a number by zero', {
  'it should return Infinity': (t) => {
    t.strictEqual(42 / 0, Infinity)
  },
  'if the number is zero': {
    'it should return NaN': (t) => {
      t.strictEqual(isNaN(0 / 0), true)
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
    t.strictEqual(42 / 0, Infinity)
  },
  'if the number is zero': {
    '# SKIP it should return NaN': (t) => {
      t.strictEqual(isNaN(0 / 0), true)
    },
    '# TODO it should not be equal to itself': (t) => {
      t.notEqual(0 / 0, 0 / 0)
    }
  }
})
```

> NOTE that when a test is skipped, or when all of a tests' assertions are skipped, the `given|arrange` and `when|act|topic` functions will not be executed

### Running Specific Tests (only)
Some test libraries like mocha have `describe.only`. Supposed doesn't have that because the `-m` flag can be used to achieve the same outcome. The idea is that if matching is an option we pass to the runner, we're less likely to commit functions that limit the tests being run. We might commit some text that doesn't need to be there, but that's less harmless.

> If you're test doesn't have an easy to match description, throw something in there to help.

```JavaScript
// test.js
const test = require('supposed')

// notice we threw `only!` in this description
// it can be whatever you want, though, as long as it's unique
test('only! when dividing a number by zero', {
  'it should return Infinity': (t) => {
    t.strictEqual(42 / 0, Infinity)
  }
})
```

```Shell
$ node test -m 'only!'
```

> The argument you pass to `-m` is used to create an instance of `RegExp`, which is then used to test the test assertions/descriptions.

### Nest/Branch Inheritance
Supposed lets you nest your tests, to branch paths and assertions, in a similar way to how vows works. Nodes in a nest inherit the `given|arrange`, and `when|act|topic` from parent nodes, if they don't define these properties.

In the following example, `given` returns a function that is used by all tests in the nest:

```JavaScript
test('when dividing a number by zero', {
  given: () => {
    return (number) => { return number / 0 }
  },
  when: (divideByZero) => { return divideByZero(42) },
  'it should return Infinity': (then) => (err, actual) => {
    then.ifError(err)
    then.strictEqual(actual, Infinity)
  },
  'if the number is zero': {
    when: (divideByZero) => { return divideByZero(0) },
    'it should return NaN': (then) => (err, actual) => {
      then.ifError(err)
      then.strictEqual(isNaN(actual), true)
    },
    'it should not be equal to itself': (then) => (err, actual) => {
      then.ifError(err)
      then.notEqual(actual, actual)
    }
  }
})
```

## Configuring Tests
Supposed allows configuration at two levels: suite level, and test level. The folliwng configurations are supported:

### Suite Configuration

* **timeout** {number} (default is 2000ms) : The amount of time that _Supposed_ waits, before it cancels a long-running test
* **assertionLibrary** {object} (default is `assert`) : The assertion library that will be passed to the tests
* **reporter** {string or object} (default is "DEFAULT") : The reporter to use for test output (DEFAULT|TAP|BRIEF|QUIET|QUIET_TAP|or a custom reporter)

```JavaScript
const events = []
const test = require('supposed').Suite({
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
  t.strictEqual(42 / 0, Infinity)
})
```

### Test Configuration

* **timeout** {number} (default is 2000ms) : The amount of time that _Supposed_ waits, before it cancels a long-running test
* **assertionLibrary** {object} (default is `assert`) : The assertion library that will be passed to the tests

```JavaScript
const expect = require('chai').expect

test('when dividing a number by zero', {
  timeout: 10000, // 10 seconds
  assertionLibrary: expect,
  when: () => {
    return 42 / 0
  },
  'it should return Infinity': (expect) => (err, actual) => {
    expect(err).to.equal(null)
    expect(actual).to.equal(Infinity)
  }
})
```

> NOTE that test configurations behave the same as everything else with respect to nest inerhitance (i.e. the timeout can be set at the top of a tree and used for all tests that don't override it)
