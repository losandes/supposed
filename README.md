Supposed
========
Supposed is a fast, hackable test framework for Node.js, TypeScript, and the Browser. Supposed runs tests concurrently, so test suites complete as quickly as possible. It has 0 dependencies (not counting dev-dependencies), and supports many Domain Service Languages DSLs: BDD, TDD, xunit, custom.

## TOC

#### Highlights

* [Get Started with Node](#get-started-with-node)
* [Get Started with the Browser](#get-started-with-the-browser)
* [Get Started with TypeScript](#typescript-support)
* [Test Syntax and DSLs](#test-syntax-and-domain-service-languages-dsls))
* [Built in Reporters](#built-in-reporters): list|tap|json|spec|markdown|md|nyan|performance|brief|summary|array|block|noop
* [Suites, & Configuring Suites](#suites)
* [Tests, & Configuring Tests](#tests)
* [Discovering and Running NodeJS Tests](#using-the-nodejs-runner)
* [Discovering and Running Browser Tests](#using-the-browser-test-server)
* [Running in the Terminal](#arguments-and-envvars) (Arguments and ENVVARS)
* [Running Specific Tests](#arguments-and-envvars)
* [Running Specific Files With The Runner](#arguments-and-envvars)
* [Using Promises in Tests](#using-promises-in-tests)
* [Using async-await in Tests](#using-async-await-in-tests)

<details>
  <summary>Full Table of Contents</summary>

  * [Test Syntax and DSLs](#test-syntax-and-domain-service-languages-dsls))
    * [The BDD DSL (Given, When, Then)](#the-bdd-dsl-given-when-then)
    * [The TDD DSL (Arrange, Act, Assert)](##the-tdd-dsl-arrange-act-assert)
    * [The xunit DSL (atomic)](#the-xunit-dsl-atomic)
    * [Custom DSLs](#custom-dsls)
  * [Arguments and ENVVARS](#arguments-and-envvars)
    * [Arguments](#rguments)
    * [ENVVARS](#envvars)
    * [Built in Reporters](#built-in-reporters)
    * [Using Multiple Reporters](#using-multiple-reporters)
  * [Suites](#suites)
    * [Configuring a Suite](#configuring-a-suite)
    * [Injecting Dependencies](#injecting-dependencies)
    * [Naming Suites](#naming-suites)
  * [Tests](#tests)
    * [Configuring Tests](#configuring-tests)
    * [Skipping Tests](#skipping-tests)
    * [Marking Tests as TODO](#skipping-tests)
    * [Running Specific Tests (only)](#running-specific-tests-only)
    * [About Nest/Branch Inheritance](#about-nestbranch-inheritance)
    * [Using Promises in Tests](#using-promises-in-tests)
    * [Using async-await in Tests](#using-async-await-in-tests)
    * [Running Tests Serially](#running-tests-serially)
  * [Discovering Tests and Running Them](#discovering-tests-and-running-them)
    * [Using the NodeJS Runner](#using-the-nodejs-runner)
      * [Configuring the NodeJS Runner](#configuring-the-nodejs-runner)
      * [Skipping File Discovery With the NodeJS Runner](#skipping-file-discovery-with-the-nodejs-runner)
      * [Running Multiple Suites](#running-multiple-suites)
      * [Running Multiple Suites In Multiple Processes](#running-multiple-suites-in-multiple-processes)    
    * [Using the Browser Test Server](#using-the-browser-test-server)
      * [Configuring the Browser Test Server](#configuring-the-browser-test-server)
      * [Skipping File Discovery With the Browser Test Server](#skipping-file-discovery-with-the-browser-test-server)
      * [Piping Browser Test Output to the Terminal](#piping-browser-test-output-to-the-terminal)
      * [Custom Browser Template](#custom-browser-template)
  * [Setup and Teardown](#setup-and-teardown)
    * [Global Setup and Teardown](#global-setup-and-teardown)
    * [Test Setup and Teardown](#test-setup-and-teardown)
  * [Latency and Performance](#latency-and-performance)
    * [Measure Latency and Performance](#measure-latency-and-performance)
  * [Test Events and Reporting](#test-events-and-reporting)
    * [About Test Events](#about-test-events)
    * [Subscribing to Test Events](#subscribing-to-test-events)
    * [Writing a Test Reporter](#writing-a-test-reporter)
    * [Registering A Test Reporter](#registering-a-test-reporter)
    * [Streaming Output to a File](#streaming-output-to-a-file)
    * [Adding Information to Report Output (event.log)](#adding-context-to-test-events-eventlog)
    * [Adding Context to Test Events (event.context)](#adding-context-to-test-events-eventcontext)
    * [Programmatic Report Consumption](#programmatic-report-consumption)
  * [Other](#other)
    * [Writing Your Own Test Runner](#writing-your-own-test-runner)

</details>

## Get Started With Node

```Shell
npm install --save-dev supposed
```

```JavaScript
// my-test.js
const test = require('supposed')

test('when dividing a number by zero, it should return Infinity', (t) => {
  t.strictEqual(42 / 0, Infinity)
})
```

```Shell
$ node my-test.js
```

## Get Started With the Browser

```Shell
npm install --save-dev supposed
```

```HTML
<script src="./node_modules/supposed/dist/supposed.min.js" />
<script>
(function (test) {
  'use strict'

  test('when dividing a number by zero, it should return Infinity', () => {
    const given = 42
    const actual = given / 0

    if (actual !== Infinity) throw new Error(`Expected ${given} / 0 to equal Infinity`)
  })
})(supposed)
</script>
```

Supposed also has a lot of [browser tooling for more comprehensive testing](#using-the-browser-test-server). You might also be interested in [piping browser test output to the terminal](#piping-browser-test-output-to-the-terminal), and creating [custom browser templates](#custom-browser-template).

## Get Started With TypeScript
Supposed includes a type file, so you don't have to install any other packages to support TypeScript.

```TypeScript
// ./bdd.test.ts
import * as Chai from 'chai';
import { ISuppose } from 'supposed';

export = async function (test: ISuppose): Promise<void> {
  await test('TypeScript: when a BDD style test is executed, it should execute the test', {
    given: () => 42,
    when: (num: number) => num / 0,
    'it should execute the test': (expect: Chai.ExpectStatic) => (err: Error, actual: number): void => {
      expect(err).to.equal(null)
      expect(actual).to.equal(Infinity)
    }
  })

  await test('TypeScript: when a BDD style test is executed with a single assertion function, it should execute the test', {
    given: () => 42,
    when: (num: number) => num / 0,
    'it should execute the test': (expect?: any, err?: Error, actual?: any): void => {
      expect(err).to.equal(null)
      expect(actual).to.equal(Infinity)
    }
  })
}

// ./tests.ts
import { expect } from 'chai'
import * as supposed from '..'

supposed.Suite({
  name: 'supposed-tests.typescript',
  assertionLibrary: expect
}).runner({
  cwd: __dirname
}).run()
```

## Test Syntax and Domain Service Languages (DSLs)

### The BDD DSL (Given, When, Then)
You can use BDD syntax to build your tests, separating the stages of a test into `given`, `when`, and as many assertions as you need:

```JavaScript
const test = require('supposed')

module.exports = test('when dividing a number by zero', {
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
const test = require('supposed')

module.exports = test('when dividing a number by zero', {
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
const test = require('supposed')

module.exports = test('when dividing a number by zero, it should return Infinity', (t) => {
  t.strictEqual(42 / 0, Infinity)
})
```

> This DSL is compatible with most test libraries when you don't nest tests within each other, and when you don't nest assertions inside of tests (i.e. describe, it)

### Custom DSLs
If you don't like the provided syntax... _configure it_! You can set/replace the synonyms for given, and when. The given synonyms can be used interchangeably with the when synonyms (there's no order, or pairing).

```JavaScript
const test = require('supposed').Suite({
  givenSynonyms: ['cause', 'before', 'setup'],
  whenSynonyms: ['effect', 'run']
})

module.exports = test('when dividing numbers by 0', {
  'cause, effect': {
    cause: () => 42,
    effect: (number) => { return number / 0 },
    'it should return Infinity': (assert) => (err, actual) => {
      assert.ifError(err)
      assert.strictEqual(actual, Infinity)
    }
  },
  'setup, run': {
    setup: () => 0,
    run: (number) => { return number / 0 },
    'it should return NaN': (assert) => (err, actual) => {
      assert.ifError(err)
      assert.strictEqual(isNaN(actual), true)
    }
  },
  'before, run': {
    before: () => 0,
    run: (number) => { return number / 0 },
    'it should return NaN': (assert) => (err, actual) => {
      assert.ifError(err)
      assert.strictEqual(isNaN(actual), true)
    }
  }
})
```

## Arguments and ENVVARS
Supposed has options that can be set with command-line arguments, or envvars. They are described here, and then the actual arguments, and envvars are listed and shown in examples below.

* **reporters**: choose reporter(s) by name (`list|tap|json|spec|markdown|md|nyan|performance|brief|summary|array|block|noop`) (comma-separated)
* **match description**: run only tests whose descriptions/behaviors match the regular expression
* **match file name**: run only tests whose file names match the regular expression (only used with runner)
* **no-color**: force supposed to display all output without color
* **report-order**: Some reporters print test outcomes in a non-deterministic order because tests run concurrently. You can override this by setting the order to "deterministic"
* **time-units**: the units to use for event timestamps (`s|ms|us|ns`) (default is `us`)

> When running in the terminal (NodeJS), Supposed detects whether it is in TTY and automatically turns colors off when it is not (i.e. if you pipe the output of supposed to another command)
>
> NOTE that timestamps use numeric representations of hrtime in nodejs, and performance.now in the browser. Changing the time-unit doesn't necessarily change the reporter output - it sets the units that are used for event times.

### Arguments

* `-r` or `--reporter` (reporters)
* `-m` or `--match` (matches description)
* `-f` or `--file` (matches file name)
* `-o` or `--report-order` (whether the report order is deterministic, or non-deterministic)
* `-u` or `--time-units` (the units to use for timestamps)
* `--no-color` (b+w terminal output)


```Shell
$ npm install --save-dev tap-parser
$ node tests -m foo -r tap -u ms -o deterministic | npx tap-parser -j | jq
```

> In that example, we run tests that have the word "foo" in their descriptions, using TAP output, and milliseconds for timestamps. We pipe the output of the tests into another package, [tap-parser](https://www.npmjs.com/package/tap-parser), and then pipe the output of that package into [jq](https://stedolan.github.io/jq/).

```Shell
$ node tests --no-color
```

### ENVVARS

* `SUPPOSED_REPORTERS` (reporters)
* `SUPPOSED_MATCH` (matches description)
* `SUPPOSED_FILE` (matches file name)
* `SUPPOSED_REPORT_ORDER` (whether the report order is deterministic, or non-deterministic)
* `SUPPOSED_TIME_UNITS` (the units to use for timestamps)
* `SUPPOSED_NO_COLOR` (b+w terminal output)

```Shell
$ npm install --save-dev tap-parser
$ export SUPPOSED_REPORTERS=tap
$ export SUPPOSED_MATCH=continuous-integration
$ export SUPPOSED_REPORT_ORDER=deterministic
$ export SUPPOSED_TIME_UNITS=ms
$ export SUPPOSED_NO_COLOR=true
$ node tests | npx tap-parser -j | jq
```

> In that example, we run tests that have the word "continuous-integration" in their descriptions, using TAP output. We pipe the output of the tests into another package, [tap-parser](https://www.npmjs.com/package/tap-parser), and then pipe the output of that package into [jq](https://stedolan.github.io/jq/).

### Built in Reporters

* `list` (default) - a concise reporter with start indication, symbols for pass|fail|skip, error details, and a summary at the end _(default: non-deterministic order)_
* `tap` - a TAP compliant reporter, which can also be piped into [other TAP reporters](https://github.com/sindresorhus/awesome-tap#reporters) _(default: non-deterministic order)_
* `json` - test events in JSON format _(default: non-deterministic order)_
* `block` - Colorized blocks with PASS|FAIL|SKIP text (like jest) _(default: non-deterministic order)_
* `spec` - the test descriptions in markdown format _(deterministic order)_
* `markdown` - the test descriptions in markdown format _(deterministic order)_
* `md` - (alias for markdown)
* `nyan` - rainbows, and flying cats? check
* `performance` - the total test duration, and the duration for each of: `given`, `when`, `then` (see [Measure Latency and Performance](#measure-latency-and-performance) for more information). _performance_ is designed to be used in combination with the _list_, and _tap_ reporters: `node tests -r list,performance`, or `node tests -r tap,performance`
* `brief` - just the summary, and the output from any failing tests
* `summary` - just the summary (no error output - useful in combination with `tap`)
* `array` - no output, but you can read the test events from `suite.config.reporters[${indexOfArrayReporter}].events` (it's easier just to `suite.subscribe`, or `suite.runner().run().then((results) => {})` though - you probably don't need this - it's mostly for testing this library)
* `noop` - turn reporting off, and do your own thing

> Note the deterministic, and non-deterministic order comments. Supposed runs tests concurrently. Reporters that indicate "non-deterministic order" report the status of each test as soon as it completes, regardless of the order in which it was discovered. These are optimized for efficiency. You can override this with `-o deterministic`. See [Arguments and ENVVARS](#arguments-and-envvars) for more info.
>
> Reporters that indicate "deterministic" order report tests status after all tests have finished, so the results are printed in the order in which the tests were discovered. These are optimized for comprehension. Reporters that are deterministic by default do not support non-deterministic output.

### Using Multiple Reporters
Supposed uses pubsub to report, so there's no limit on the number of reporters that can be used. Some reporters when used in combination can cause problems (nyan isn't really compatible with anything else), but others can be helpful. Let's say you like the TAP output, but you want a summary:

```Shell
$ node tests -r tap,summary --no-color

TAP version 13
ok 1 - given... when... then...
1..1

# total: 1  passed: 1  failed: 0  skipped: 0  duration: 8ms
```

```Shell
$ node tests -r list,performance

✓ given... when... then...
#   latency: 8ms (given: 856ns, when: 10µs, then: 8ms)

# total: 1  passed: 1  failed: 0  skipped: 0  duration: 8ms
```

> You can also [register your own reporters](#writing-a-test-reporter), as well as [subscribe to test events](#subscribing-to-test-events) to get the desired effect you're looking for. This is particularly useful for alerting, or sending a messages to Slack when tests fail in continuous-integration.

## Suites
The default `supposed` is a Suite, and you can mutate the configuration using `supposed.configure({...})`. Configuring this multiple times will cause unexpected behaviors, since the technique is mutation. If you have reason to have multiple configurations, or are simply uncomfortable with mutability, you can create and configure Suites.

```JavaScript
const db = require('./db')
const supposed = require('supposed')

const suite1 = supposed.Suite({
  name: 'unit-tests',
  reporter: 'noop'
}).runner({
  directories: ['unit-tests']
})

const suite2 = supposed.Suite({
  name: 'integration-tests',
  reporter: 'noop',
  inject: {
    db
  }
}).runner({
  directories: ['integration-tests']
})

Promise.all([suite1.run(), suite2.run()], (results) => {
  console.log(results)
})
```

> Also checkout the more complete example for [using multiple suites](#running-multiple-suites).

### Configuring a Suite
Whether your using `supposed.configure({...})`, or creating a new `supposed.Suite({...})`, the following configurations are supported (configuration is not required):

* `name` {string} (default is generated) - A name for the suite (suites can be retrieved by name: `require('supposed').suites.mySuite`)
* `timeout` {number} (default is 2000ms) - The amount of time in milliseconds that _Supposed_ waits, before it cancels a long-running test
* `assertionLibrary` {object} (default for nodeJS is `assert`; no default for browsers) - The assertion library that will be passed to the tests
* `reporter` {string|`(event: ITestEvent): Promise<void>`} - The reporter to use for test output (`list|tap|json|spec|markdown|md|nyan|performance|brief|summary|array|block|noop`), or a function
* `reporters` {string[]} - A comma-separated list of reporters to use (by name) (`list|tap|json|spec|markdown|md|nyan|performance|brief|summary|array|block|noop`)
* `match` {string|RegExp|`{ test (description: string): boolean; }`} - run only tests whose descriptions/behaviors match the regular expression, or pass this test
* `file` {string|RegExp|`{ test (description: string): boolean; }`} - run only tests whose file name matches the regular expression, or pass this test
* `useColors` {boolean} - whether or not to use color in the reporter output
* `inject` {any} - when present this object will be available to tests via `suite.dependencies`. If your test files `module.exports = (suite, dependencies) => {}`, this object will also be passed as the second argument to your exported function.
* `givenSynonyms` {string[]} - an array of words to be used in place of "given|arrange"
* `whenSynonyms` {string[]} - an array of words to be used in place of "when|act|topic"
* `timeUnits` {string} (`s|ms|us|ns`) (default is `us`) - the units to use for event timestamps
* `reportOrder` {string}`deterministic|non-deterministic`)  - supposed runs tests concurrently, and some reporters report as tests complete (non-deterministically). _reportOrder_ lets you override that behavior and report deterministically
* `exit` {function} - By default, the runner will `process.exit(1)` if any tests fail. This is to support normal behavior with CI, or git pre-commit, and pre-push hooks. You can override this by providing your own exit function
* `planBuffer` {number} - the milliseconds after plans are created to wait before executing a plan. If you aren't using a suite, supposed doesn't know when all of the tests are planned, so it relies on a race condition that assumes if no plans have been created in a period of time, then all plans must be submitted. On slower machines, it may be possible for this race condition to be beat, so you can override it.

> If neither `reporter`, nor `reporters` are present, the `default` reporter will be used

```JavaScript
const { expect } = require('chai')
const { databaseConnection } = require('./db')
const suite = require('supposed').Suite({
  name: 'integration-tests',
  assertionLibrary: expect,
  timeout: 10000, // 10s
  reporters: ['tap', 'summary'],
  reporter: (event) => { /* ... */ },
  match: /^ONLY/,
  useColors: false,
  inject: { databaseConnection },
  givenSynonyms: ['cause'],
  whenSynonyms: ['effect'],
  exit: (results) => process.exit(results.totals.failed)
})
```

`exit` can be used to _avoid_ exiting the process, and always return the results:

```JavaScript
const supposed = require('supposed')

supposed.Suite({
  exit: (results) => results
}).runner()
  .run()
  .then((results) => {
    // do something with the results
    return results
  })
  .then((results) => process.exit(results.totals.failed))
```

### Injecting Dependencies
Suites will include a `dependencies` property, if you provide an `inject` object when configuring them.

```JavaScript
// ./first-module/first-spec.js
const test = require('supposed').suites['injecting-dependencies']
const { foo } = test.dependencies

module.exports = test('given first-module, when... it...', (expect) => {
  expect(foo).to.equal('bar')
})

// ./tests.js
const { expect } = require('chai')
const supposed = require('supposed')

supposed.Suite({
  name: 'injecting-dependencies',
  assertionLibrary: expect,
  inject: { foo: 'bar' }
}).runner()
  .run()
```

If you're ok with not running the tests directly (i.e. `node first-spec.js`), you can also export a factory that receives the suite, and dependencies.

> Notice that the modules don't need to `require` supposed, or any assertion libraries when using this convention.

```JavaScript
// ./first-module/first-spec.js
module.exports = (test, dependencies) => {
  const { foo } = dependencies

  test('given first-module, when... it...', (expect) => {
    expect(foo).to.equal('bar')
  })
}

// ./tests.js
const { expect } = require('chai')
const supposed = require('supposed')

supposed.Suite({
  name: 'injecting-dependencies',
  assertionLibrary: expect,
  inject: { foo: 'bar' }
}).runner()
  .run()
```

You can turn off the behavior demonstrated in "./first-module/first-spec.js" by passing `injectSuite: false` to the runner configuration:

```JavaScript
const supposed = require('supposed')
const runner = supposed.runner({
  injectSuite: false
})
```

### Naming Suites
By giving your suite a name, other files can find the suite by name, via the `suites` property.

```JavaScript
// ./tests.js
const { expect } = require('chai')
const supposed = require('supposed')

supposed.Suite({
  name: 'injecting-dependencies',
  assertionLibrary: expect,
  inject: { foo: 'bar' }
}).runner()
  .run()

// ./first-module/first-spec.js
const test = require('supposed').suites['injecting-dependencies']
const { foo } = test.dependencies

module.exports = test('given first-module, when... it...', (expect) => {
  expect(foo).to.equal('bar')
})
```

## Tests
At their simplest, tests are just a description, and a function.

```JavaScript
require('supposed')('given... when... then...', () => { /*assert something*/ })
```

Examples in * [Test Syntax and Domain Service Languages (DSLs)](#test-syntax-and-domain-service-languages-dsls)) demonstrate how supposed supports a variety of setup, and execution conventions to support running one test, and deriving many, clearly defined assertions about the expected behaviors our software supports. When using these, we have an opportunity to both test, and document our code at the same time.

```JavaScript
const test = require('supposed')

module.exports = test('when dividing a number by zero', {
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

Using the default reporter, this will print:

```
✓ when dividing a number by 0, it should return Infinity
✓ when dividing a number by 0, if the number is zero, it should return NaN
✓ when dividing a number by 0, if the number is zero, it should not be equal to itself
```

### Configuring Tests

* `timeout` {number} (default is 2000ms) - The amount of time that _supposed_ waits, before it cancels a long-running test

```JavaScript
const expect = require('chai').expect

test('when dividing a number by zero', {
  timeout: 10000, // 10 seconds
  when: () => {
    return 42 / 0
  },
  'it should return Infinity': () => (err, actual) => {
    expect(err).to.equal(null)
    expect(actual).to.equal(Infinity)
  }
})
```

> NOTE that test configurations behave the same as everything else with respect to nest inheritance (i.e. the timeout can be set at the top of a tree and used for all tests that don't override it)

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

// notice we threw `ONLY` in this description
// it can be whatever you want, though, as long as it's unique
test('ONLY when dividing a number by zero', {
  'it should return Infinity': (t) => {
    t.strictEqual(42 / 0, Infinity)
  }
})
```

```Shell
$ node test -m 'ONLY'
```

> The argument you pass to `-m` is used to create an instance of `RegExp`, which is then used to test the test assertions/descriptions.

### About Nest/Branch Inheritance
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

### Using Promises in Tests
Each test function can run asyncronously by using `Promise`:

```JavaScript
const test = require('supposed')

test('when dividing a number by zero', {
  given: () => new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(42)
    }, 0)
  }),
  when: (number) => new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(number / 0)
    }, 0)
  }),
  'it should return Infinity': (then) => (err, actual) => new Promise((resolve, reject) => {
    then.ifError(err)
    then.strictEqual(actual, Infinity)
    resolve()
  })
})
```

or:
```JavaScript
const test = require('supposed')

test('divide by zero equals infinity', (t) => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(42 / 0)
  }, 0)
}).then((actual) => {
  t.strictEqual(actual, Infinity)
}))
```

### Using async-await in Tests
Each test function can run asyncronously by using `async/await`:

```JavaScript
const test = require('supposed')

test('when dividing a number by zero', {
  given: async () => {
    const given = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(42)
      }, 0)
    })

    return given
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
const test = require('supposed')

test('divide by zero equals infinity', async (t) => {
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

## Discovering Tests and Running Them
In getting started, we saw how supposed can run tests without a runner. A bear bones test suite might simply `require`, or `import` each test file. However that produces multiple result summaries which can be hard to parse or understand.

Using a runner, Supposed will group the tests into batches, and summarize the outcomes in a single report. Supposed has [a runner for nodejs tests](using-the-nodejs-runner), [an a server runner for browser tests](#using-the-browser-test-server).

### Using the NodeJS Runner
The following example has two test files, and a runner file (test.js). In this example, the default Suite is used, and is configured in test.js. The runner is not configured, so default configurations are used.

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

#### Configuring the NodeJS Runner
The runner can be configured to look in specific directories, ignore others, and to match the naming conventions of your choice.

* `cwd` {string} (default: `process.cwd()`) - The current working directory that the file-tree walker should start from
* `directories` {string[]} (default: `['.']`) - You can specify an array of directories to include if you want. By default, it will recurse through every folder in the current working directory (cwd).
* `matchesNamingConvention` {string|RegExp|`{ test (filePath: string): boolean; }`} (default: `/.([-.]test(s?)\.js)|([-.]spec(s?)\.js)$/i`): The naming convention for your test files. When you define this as an object, the object must have a `test` function that returns a boolean. By default it will match any file that ends in `-test.js`, `.test.js`, `-tests.js`, `.tests.js`, `-spec.js`, `.spec.js`, `-specs.js`, or `.specs.js`. It will _not_ match `test.js`, `tests.js`, `spec.js`, nor `specs.js`, so these names are safe for defining your runner(s).
* `matchesIgnoredConvention` {string|RegExp|`{ test (filePath: string): boolean; }`} (default: `/node_modules/i`) - A convention used to ignore directories, or files. When you define this as an object, the object must have a `test` function that returns a boolean. By default, the `node_modules` directory will be ignored. If you override this, you have to ignore that directory as well, unless you want it to run tests in your node_modules directory.
* `injectSuite` {boolean} (default: true) - If your module exports a function that isn't a reference to supposed, supposed will try to inject itself into that function. If you don't want supposed to do that, set this to false

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

#### Skipping File Discovery With the NodeJS Runner
You can use the runner's `runTests` function to run an array of tests, if you prefer that. It expects an array of functions that execute the tests:

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
  .runner()
  .runTests(() => [
    require('./first-spec'),
    require('./second-spec')
  ])
```

#### Running Multiple Suites
This example demonstrates how you can execute multiple suites, and then join the results into a single report.

> also see [the working example](tests.examples/runners/multiple-suites)

```JavaScript
// ./first-module/first-spec.js
const test = require('supposed').suites['supposed-tests.first-module']
const { expect } = test.dependencies

module.exports = test('given first-module, when... it...', (t) => {
  expect(42 / 0).to.equal(Infinity)
})

// ./first-module/first-suite.js
const { expect } = require('chai')
const suite = require('supposed').Suite({
  name: 'supposed-tests.first-module',
  inject: { expect },
  reporter: 'noop'
})

module.exports = {
  suite,
  runner: suite.runner({
    cwd: __dirname
  })
}

// ./second-module/second-spec.js
const test = require('supposed').suites['supposed-tests.second-module']

module.exports = test('given second-module, when... it...', (t) => {
  t.strictEqual(42 / 0, Infinity)
})

// ./second-module/second-suite.js
const suite = require('supposed').Suite({
  name: 'supposed-tests.second-module',
  reporter: 'noop'
})

module.exports = {
  suite,
  runner: suite.runner({
    cwd: __dirname
  })
}

// ./tests.js
const supposed = require('supposed')
const s1 = require('./first-module/first-suite.js')
const s2 = require('./second-module/second-suite.js')
const suite = supposed.Suite({ name: 'multiple-suites' })
const reporter = suite.reporterFactory.get('list')
const subscription = (event) => {
  if (event.type === 'TEST') {
    reporter.write(event)
  }
}
s1.suite.subscribe(subscription)
s2.suite.subscribe(subscription)

const startTime = Date.now()
reporter.write({ type: 'START', time: startTime, suiteId: suite.config.name })

Promise.all([s1.runner.run(), s2.runner.run()])
  .then((results) => {
    reporter.write({
      type: 'END',
      time: Date.now(),
      suiteId: suite.config.name,
      totals: results.reduce((tally, current) => {
        tally.total += current.totals.total
        tally.passed += current.totals.passed
        tally.skipped += current.totals.skipped
        tally.failed += current.totals.failed
        tally.broken += current.totals.broken

        return tally
      }, {
        total: 0,
        passed: 0,
        skipped: 0,
        failed: 0,
        broken: 0,
        startTime: startTime,
        endTime: Date.now()
      })
    })
  })
```

#### Running Multiple Suites In Multiple Processes
This example demonstrates how you can execute a process per suite, and then join the stdout into a single table. It uses the `json` reporter to make it easy to parse.

> also see [the working example](tests.examples/runners/multiple-suites-multiple-processes)

```JavaScript
// ./first-module/first-spec.js
const test = require('supposed').suites['supposed-tests.first-module']
const { expect } = test.dependencies

module.exports = test('given first-module, when... it...', (t) => {
  expect(42 / 0).to.equal(Infinity)
})

// ./first-module/first-suite.js
const { expect } = require('chai')
const suite = require('supposed').Suite({
  name: 'supposed-tests.first-module',
  inject: { expect },
  reporter: 'json'
})

module.exports = suite.runner({
  cwd: __dirname
}).run()

// ./second-module/second-spec.js
const test = require('supposed').suites['supposed-tests.second-module']

module.exports = test('given second-module, when... it...', (t) => {
  t.strictEqual(42 / 0, Infinity)
})

// ./second-module/second-suite.js
const suite = require('supposed').Suite({
  name: 'supposed-tests.second-module',
  reporter: 'json'
})

module.exports = suite.runner({
  cwd: __dirname
}).run()

// ./tests.js
const { execFile } = require('child_process')
const path = require('path')

const suites = [
  './first-module/first-suite.js',
  './second-module/second-suite.js'
]

const promises = suites.map((suite) => new Promise((resolve, reject) => {
  execFile('node', [path.join(__dirname, suite)], (error, stdout, stderr) => {
    if (error) {
      return reject(error)
    }

    try {
      resolve({ suite, events: JSON.parse(stdout).map((row) => row.event) })
    } catch (e) {
      e.stdout = stdout
      throw e
    }
  })
}))

Promise.all(promises)
  .then((results) => {
    const errors = []
    const rows = results
      .map((result) => {
        const endEvent = result.events.find((event) => event.type === 'END')

        if (endEvent.totals.failed > 0) {
          errors.push(result)
        }

        return {
          suite: result.suite,
          total: endEvent.totals.total,
          passed: endEvent.totals.passed,
          failed: endEvent.totals.failed,
          broken: endEvent.totals.broken,
          skipped: endEvent.totals.skipped
        }
      })

    console.table(rows)

    if (errors.length) {
      console.log(errors)
      process.exit(1)
    }
  }).catch((err) => {
    console.log(err)
    process.exit(1)
  })
```

### Using the Browser Test Server
Using the runner's `startServer` function, supposed will find test files in your project, concatenate them, and host a test page on a NodeJS HTTP server.

> When concatenating, all modules are wrapped in an IIFE, so they remain encapsulated. However, no additional libraries, nor manipulation is performed, so you can't just `require` things without doing some additional work.
>
> If you use `module.exports` to export a factory supposed will be injected into that factory, unless you set `injectSuite: false`

The following example has two test files, and a runner file (test.js). In this example, the default Suite is used, and is configured in test.js. The runner is not configured, so default configurations are used.

```JavaScript
// ./first-module/first-spec.js
module.exports = (test) => test('given first-module, when...', {
  given: () => 42,
  when: (given) => given / 0,
  'it...': () => (err, actual) => {
    if (err) {
      throw err
    }

    if (actual !== Infinity) {
      throw new Error(`Expected ${actual} === Infinity`)
    }
  }
})

// ./second-module/second-spec.js
module.exports = (test) => test('given second-module, when...', {
  given: () => 4200,
  when: (given) => given / 0,
  'it...': () => (err, actual) => {
    if (err) {
      throw err
    }

    if (actual !== Infinity) {
      throw new Error(`Expected ${actual} === Infinity`)
    }
  }
})

// ./tests.js
module.exports = require('supposed')
  .configure({ name: 'foo', inject: { foo: 'bar' } }) // optional
  .runner({ cwd: __dirname })
  .startServer()

// prints server is listening on 42001
```

#### Configuring the Browser Test Server
Unless you provide a `paths` property on the runner config, the browser test server will use the runner configurations from [Configuring the NodeJS Runner](#configuring-the-nodejs-runner) to find the test files, and pass them to the runner. So in addition to all of the configurations in [Configuring the NodeJS Runner](#configuring-the-nodejs-runner), the browser server supports the following configurations, all of which are optional:

* `title` {string} (default: "supposed") - the HTML _title_ and _h1_ for the test page
* `port` {number} (default: 42001) - the port number to host the server on
* `dependencies` {string[]} - an array of paths to scripts that your library depends on - these precede the tests in the resulting web page
* `paths` {string[]} - an array of file paths to the files you want the server to concatenate - this will [Skip File Discovery With the Browser Test Server](#skipping-file-discovery-with-the-browser-test-server). There's no need to set both `dependencies` _and_ `paths`
* `styles` {string} - CSS to customize the test view
* `supposed` {string} - the path to this library, if you have it somewhere special, or if your cwd isn't the directory where your node_modules are
* `template` {string} - your own [test-browser-template](src/runners/test-browser-template.js) if the default one doesn't meet your needs. Note that `// {{TEST_MODULES}}` is where the discovered tests get injected, so if you omit, or change that line, no tests will be printed to the page
* `stringifiedSuiteConfig` {string} - the config for supposed _in_ the browser (you have one to run everything, but our browser tests can have their own configuration) i.e. `{ reporter: 'tap' }` (if your config is much more than the reporter, you might opt for a custom template instead)
* `page` {string} - full control over the page and generation of it - if you're using this, you might be better off just writing your own browser test runner

> Also see [Custom Browser Template](#custom-browser-template) for an example

#### Skipping File Discovery With the Browser Test Server
If you pass an array of `paths` to the runner, `startServer` will skip file discovery, and load all of the paths:

```JavaScript
// ./setup.js
module.exports = (test) => {
  test.dependencies = test.dependencies || {}
  test.dependencies.foo = 'bar'
}

// ./first-module/first-spec.js
module.exports = (test) => test('given first-module', {
  'when...': {
    given: () => 42,
    when: (given) => given / 0,
    'it...': () => (err, actual) => {
      if (err) {
        throw err
      }

      if (actual !== Infinity) {
        throw new Error(`Expected ${actual} === Infinity`)
      }
    }
  },
  'foo should be available from setup.js': () => {
    if (test.dependencies.foo !== 'bar') { // eslint-disable-line no-undef
      throw new Error(`Expected foo ${typeof test.dependencies.foo} to be {string}`)
    }
  }
})

// ./second-module/second-spec.js
module.exports = (test) => test('given second-module, when...', {
  given: () => 4200,
  when: (given) => given / 0,
  'it...': () => (err, actual) => {
    if (err) {
      throw err
    }

    if (actual !== Infinity) {
      throw new Error(`Expected ${actual} === Infinity`)
    }
  }
})

// ./tests.js
const path = require('path')

module.exports = require('supposed')
  .configure({ name: 'foo', inject: { foo: 'bar' } }) // optional
  .runner({
    paths: [
      path.join(__dirname, 'setup.js'),
      path.join(__dirname, 'first-spec.js'),
      path.join(__dirname, 'second-spec.js')
    ]
  })
  .startServer()

// prints server is listening on 42001
```

#### Piping Browser Test Output to the Terminal
If you're going to use supposed with a headless browser for testing, this example demonstrates how to get the output from the browser into your terminal, and `process.exit(1)`, if any of the tests fail. The examples use puppeteer as the headless browser.

If you break the setup into two files, it's easy to use with CI, as well as manually. This example includes a "server" file, which starts the server, and runs the tests, as well as an "index" which executes the "server" module, then closes the server, and exits with an appropriate status code. CI, or pre-commit/pre-push hooks can use the "index", and you can call "server" directly to test manually, or debug.

> See [Configuring the Browser Test Server](#configuring-the-browser-test-server) for more information on how to configure `suite.runner()`

```JavaScript
// ./first-spec.js
module.exports = (test) => test('given first-module, when...', {
  'it ...': (t) => {
    t.strictEqual(42 / 0, Infinity)
  }
})

// ./second-spec.js
module.exports = (test) => test('given second-module, when... it...', (t) => {
  t.strictEqual(42 / 0, Infinity)
})

// ./server.js
const path = require('path')
const puppeteer = require('puppeteer')
const supposed = require('supposed')
const __projectdir = process.cwd()
const suite = supposed.Suite({
  name: 'browser-tests'
})

module.exports = suite.runner({
  // the title of the HTML page
  title: 'browser-tests',
  // the directories where your tests are
  directories: ['./tests.documentation/browser-tests'],
  // NOTE the "event" reporter - this is required for JSON.parse to work (below)
  stringifiedSuiteConfig: '{ reporter: "event", assertionLibrary: assert }',
  // any libraries your app, library, or tests depend on
  dependencies: ['/node_modules/some-assertion-lib/assert.js']
}).startServer()
  .then(async (context) => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    page.on('console', async (msg) => {
      const txt = msg.text()

      try {
        const json = JSON.parse(txt)
        context.lastEvent = json
        suite.config.reporters.forEach((reporter) => reporter.write(json))

        if (json.type === 'END' && json.totals.failed > 0) {
          // maybe print a PDF that someone can review if this is being automated
          await page.pdf({ path: path.join(__projectdir, `test-log.${Date.now()}.pdf`), format: 'A4' })
        }
      } catch (e) {
        console.log(txt)
        context.lastEvent = txt
      }
    })

    await page.goto(`http://localhost:${context.runConfig.port}`, { waitUntil: 'networkidle2' })
    await browser.close()

    return context
  })


// ./index.js
require('./server').then((context) => {
  context.server.close()
  process.exit(context.lastEvent.totals.failed)
})
```

#### Custom Browser Template
The browser runner is optimized for testing libraries, and it doesn't do any packaging. There are only so many assumptions it can make. This example demonstrates how you can take advantage of the tooling around the browser runner, but with a custom template. In this example, we:

* Hard code the test paths
* Disable test discovery
* Use a custom template for executing the suite

> This example doesn't get involved with packaging (i.e. webpack/babel/browserify), but this is likely the best way to use the library if you are using packaging technologies.

```JavaScript
// ./first-module/first-spec.js
(function (root) {
  // eslint-disable-line no-extra-semi
  'use strict';

  root.firstSpec = (test) => test('given first-spec, when...', {
    given: () => 42,
    when: (given) => given / 0,
    'it...': () => (err, actual) => {
      if (err) {
        throw err
      }

      if (actual !== Infinity) {
        throw new Error(`Expected ${actual} === Infinity`)
      }
    }
  })
})(window);

// ./second-module/second-spec.js
(function (root) {
  // eslint-disable-line no-extra-semi
  'use strict';

  root.secondSpec = (test) => test('given second-spec, when...', {
    given: () => 42,
    when: (given) => given / 0,
    'it...': () => (err, actual) => {
      if (err) {
        throw err
      }

      if (actual !== Infinity) {
        throw new Error(`Expected ${actual} === Infinity`)
      }
    }
  })
})(window)

// ./test-template.js
(function (root) {
  'use strict';

  root.supposed
    .Suite({
      reporter: 'event'
    })
    .runner()
    .runTests([
      root.firstSpec,
      root.secondSpec
    ])
})(window);


// ./browser-tests.js
const fs = require('fs')
const path = require('path')

module.exports = require('supposed')
  .runner({
    // give your test screen a title
    title: 'custom-template',
    // set the current working directory, if necessary
    // this should be the directory where your node_modules are
    cwd: process.cwd(),
    // set the port if you want to
    port: 42006,
    // providing a directory that doesn't exist circumvents test discovery
    // because no tests will be found there
    directories: ['./deadend'],
    // put some paths to the tests here, since we circumvented test discovery
    // you can also add any other libraries your code depends on here
    // _tip_: add the path to supposed here if you chose a cwd other than where
    // your node_modules are
    // _tip_: if you packaged your app, and/or tests, this is where you would
    // refererence the output bundle
    dependencies: [
      'first-module/first-spec.js',
      'second-module/second-spec.js'
    ],
    /*
     * Alternatively you can load them yourself with the `scripts` property.
     * This is particularly useful if the paths aren't relative
     scripts: [
       fs.readFileSync(path.join(__dirname, 'first-spec.js')).toString(),
       fs.readFileSync(path.join(__dirname, 'second-spec.js')).toString()
     ],      
     */   
    // The template will run after all of the dependencies, and/or scripts,
    // so it's safe to compose whatever you need to, and run the suite
    template: fs.readFileSync(path.join(__dirname, 'test-template.js')).toString()
  })
  .startServer()
```

## Setup and Teardown

### Global Setup and Teardown
The runner returns a Promise, which returns the context: the results of each test file, the test file paths, the configuration that was used to execute the tests, and the suite. If you want to run an operation (i.e. teardown) after all tests pass, your tests have to both accept suite injection, and return a promise that resolves after all assertions in that file are complete. This can be accomplished by nesting all of your tests under one grouping, and returning that (e.g. like _describe_ in mocha, jasmine, etc.).

> Also see [Setup and Teardown](#setup-and-teardown)

```JavaScript
// ./first-module/first-spec.js
// exports a factory that accepts the suite
module.exports = (describe) => {
  return describe('first-module', {
    'when... it...': expect => {
      expect(42 / 0).to.equal(Infinity)
    })
  })
}

// ./second-module/second-spec.js
// uses the suite by name
// this allows this file to be run directly (`node second-spec`) without
// the suite _if_ it doesn't depend on the suite as a composition root (DI)
const describe = require('supposed').suites['my-suite']

return describe('second-module', {
  'when... it...': expect => {
    expect(42 / 0).to.equal(Infinity)
  })
})

// ./tests.js
const suite = require('supposed')
const setup = Promise.resolve({ some: 'dependencies' })
const teardown = (context) => { console.log(context) }

module.exports = setup.then((dependencies) =>
  supposed.Suite({
    name: 'my-suite'
    inject: dependencies
  }).runner({
    cwd: __dirname
  }).run()
).then(teardown)
```

> NOTE if any of your test files don't return a promise, or resolve a promise before they are complete, `then` will execute before your tests finish running. Whether or not they show upin the context/results depends on a race condition.

### Test Setup and Teardown
All supposed tests are promises, so we can chain them together, feed them with setup, and tear down afterwards:

```JavaScript
const test = require('supposed')

const setup = Promise.resolve(42)
const teardown = (context) => { console.log(context) }

module.exports = setup()
.then((given) => test('given... when... then...', () => { /*assert something*/ }))
.then(() => test('given... when... then...', () => { /*assert something*/ }))
.then(teardown)
```

## Latency and Performance

### Measure Latency and Performance
Supposed measures the the duration for each of: `given`, `when`, `then`. In NodeJS, it uses `process.hrtime`, and in the browser it uses `performance.now`, both of which are reported to be accurate to the microsecond.

While supposed avoids including it's own operations in the measurements, it does nothing to isolate the measurements from event loop effects, such as other operations running concurrently in the same process. Because of this, the performance measurements should only be used for subjective analysis (i.e. approximate comparison, etc.) unless you are running only one test.

The easiest way to check these measurements out is to use the _performance_ formatter in conjunction with the _list_, and _tap_ reporters: `node tests -r list,performance`, or `node tests -r tap,performance`. For a more detailed example, checkout [Registering A Test Reporter](#registering-a-test-reporter).

## Test Events and Reporting

### About Test Events
Supposed uses a simple event system (pubsub) to report. You can subscribe to these events in two different ways. Before demonstrating that, let's look at the types of events you can expect. First lets look at the facade interface, which includes all of the properties for every type of event:

```TypeScript
interface ISimpleTally {
  total: number;
  passed: number;
  skipped: number;
  failed: number;
  broken: number;
  startTime: number;
  endTime: number;
}

interface IDuration {
  seconds: number;
  milliseconds: number;
  microseconds: number;
  nanoseconds: number;
}

interface ISupposedEvent {
  suiteId?: string;
  batchId?: string;
  testId?: string;
  count?: number;
  time: number;
  type: string;
  status?: string;
  behavior?: string;
  behaviors?: string[];
  plan?: {
    count: number;
    completed: number;
  };
  error?: Error;
  log?: any;
  context?: any;
  duration?: {
    given: IDuration;
    when: IDuration;
    then: IDuration;
    total: IDuration;
  };
  totals?: ISimpleTally;
}
```

Some more specific event interfaces are supported for TypeScript:

```TypeScript
interface IStartEvent {
  type: 'START';
  suiteId: string;
  time: number;
}

interface IEndEvent {
  type: 'START';
  suiteId: string;
  time: number;
  totals: ISimpleTally;
}

interface ITestEvent {
  suiteId: string;
  batchId: string;
  testId: string;
  count: number;
  time: number;
  type: 'TEST';
  status: 'PASSED' | 'SKIPPED' | 'FAILED' | 'BROKEN';
  behavior: string;
  behaviors: string[];
}

interface ITestPassedEvent extends ITestEvent {
  status: 'PASSED';
  log?: any;
  context?: any;
  duration: {
    given: IDuration;
    when: IDuration;
    then: IDuration;
    total: IDuration;
  };
}

interface ITestFailedEvent extends ITestEvent {
  status: 'FAILED' | 'BROKEN';
  error: Error;
}
```

* `suiteId` - The name you gave the suite, or a generated id
* `batchId` - A hash of the first description in a test file, preceded by a "B" (i.e. "B2703165877")
* `testId` - A hash of the `behavior`, preceded by a "T" (i.e. "T2703165877")
* `count` - The index of this test in relation to all of the tests a suite is running (count is set upon test completion)
* `time` - The time the event occurred (not a datetime; in microseconds by default, using hrtime, or performance.now)
* `type` - The event type (`START|START_BATCH|START_TEST|TEST|END_BATCH|END_TALLY|FINAL_TALLY|END`)
* `status` - The outcome of the test (`TEST` events only) (`PASSED|SKIPPED|FAILED|BROKEN`)
* `behaviors` - The descriptions, including inherited descriptions in an array
* `behavior` - `behaviors` joined into a string with commas
* `plan` - Plan information for TAP reporting
* `error` - For `TEST` events, if the status is `FAILED` or `BROKEN`, an error will be present
* `log` - For `TEST` events, if an assertion returns `{ log: any; }` the value will be emitted as part of this event, and included in the test output with reporters that support it
* `context` - For `TEST` events, if an assertion returns `{ context: any; }` the value will be emitted as part of this event
* `duration` - The time it took to run `given`, `when`, the assertion, and the total duration for a test
* `totals` - the tally of all test outomes: passed, failed, skipped, broken, total, start and end times, and duration

> The difference between `log` and `context` is that `log` can be included in reporter output

### Subscribing to Test Events
In this example, we'll make our own reporter that prints the test status, descriptions, and the performance information. This example uses `subscribe`, and sets the reporter to "noop" to achieve this.

Use `subscribe` when you want normal reporting, and also need a side-car, like to write output to a repository.

> Consider reading [about test events](#about-test-events) if you haven't already

```JavaScript
// ./first-module/first-spec.js
module.exports = (test) => test('given first-module, when... it...', (t) => {
  t.strictEqual(42 / 0, Infinity)
})

// ./second-module/second-spec.js
module.exports = (test) => test('given second-module, when... it...', (t) => {
  t.strictEqual(42 / 0, Infinity)
})

// ./tests.js
const supposed = require('supposed')

const formatDuration = (duration) => {
  if (!duration) {
    return 0
  }

  if (typeof duration === 'number' && duration.seconds > 1) {
    return `${Math.round(duration.seconds)}s`
  } else if (duration.milliseconds > 1) {
    return `${Math.round(duration.milliseconds)}ms`
  } else if (duration.microseconds > 1) {
    return `${Math.round(duration.microseconds)}µs`
  } else if (duration.nanoseconds > 1) {
    return `${Math.round(duration.nanoseconds)}ns`
  } else {
    return 0
  }
}

module.exports = supposed.Suite({
  reporter: 'noop'  // use the noop reporter to turn off supposed reporting and roll your own
}).subscribe((event) => {
  if (event.type === 'TEST') {
    const durations = [
      `given: ${formatDuration(event.duration.given)}`,
      `when: ${formatDuration(event.duration.when)}`,
      `then: ${formatDuration(event.duration.then)}`
    ]

    // console.log(`  ${event.status}  ${event.behavior} (${durations.join(', ')})`)
    console.log(`${event.status} ${event.behavior} (duration: ${formatDuration(event.duration.total)} (${durations.join(', ')}))`)
  }
})
  .runner({ cwd: __dirname })
  .run()
```

### Writing a Test Reporter
If the reporters supposed offers don't meet your needs, it's pretty easy to roll your own.

Use `reporter` when you want to override the reporting mechanism of supposed the same way all the time

> Consider reading [about test events](#about-test-events) if you haven't already
>
> Also see [Registering A Test Reporter](#registering-a-test-reporter)

```JavaScript
// ... (from example above)
// ./tests.js
const supposed = require('supposed')

const formatDuration = (duration) => {
  if (!duration) {
    return 0
  }

  if (typeof duration === 'number' && duration.seconds > 1) {
    return `${Math.round(duration.seconds)}s`
  } else if (duration.milliseconds > 1) {
    return `${Math.round(duration.milliseconds)}ms`
  } else if (duration.microseconds > 1) {
    return `${Math.round(duration.microseconds)}µs`
  } else if (duration.nanoseconds > 1) {
    return `${Math.round(duration.nanoseconds)}ns`
  } else {
    return 0
  }
}

module.exports = supposed.Suite({
  reporter: (event) => {
    if (event.type === 'TEST') {
      const durations = [
        `given: ${formatDuration(event.duration.given)}`,
        `when: ${formatDuration(event.duration.when)}`,
        `then: ${formatDuration(event.duration.then)}`
      ]

      // console.log(`  ${event.status}  ${event.behavior} (${durations.join(', ')})`)
      console.log(`${event.status} ${event.behavior} (duration: ${formatDuration(event.duration.total)} (${durations.join(', ')}))`)
    }
  }
}).runner({ cwd: __dirname })
  .run()
```

### Registering A Test Reporter
Always overriding the `reporter` configuration removes support for ENVVARs. To write your own reporter, and be able to use it like all the other reporters, you can register the reporter.

Use `reporterFactory.add` when you want to use 3rd party reporter, or write your own reporter, and still want to be able to switch reporters with [argv, and/or ENVVARS](#arguments-and-envvars).

> Consider reading [about test events](#about-test-events) if you haven't already

```JavaScript
// ... (from examples above)
// ./tests.js
const supposed = require('supposed')

function MyReporter () {
  const formatDuration = (duration) => {
    if (!duration) {
      return 0
    }

    if (typeof duration === 'number' && duration.seconds > 1) {
      return `${Math.round(duration.seconds)}s`
    } else if (duration.milliseconds > 1) {
      return `${Math.round(duration.milliseconds)}ms`
    } else if (duration.microseconds > 1) {
      return `${Math.round(duration.microseconds)}µs`
    } else if (duration.nanoseconds > 1) {
      return `${Math.round(duration.nanoseconds)}ns`
    } else {
      return 0
    }
  }

  const write = (event) => {
    if (event.type === 'TEST') {
      const durations = [
        `given: ${formatDuration(event.duration.given)}`,
        `when: ${formatDuration(event.duration.when)}`,
        `then: ${formatDuration(event.duration.then)}`
      ]

      // console.log(`  ${event.status}  ${event.behavior} (${durations.join(', ')})`)
      console.log(`${event.status} ${event.behavior} (duration: ${formatDuration(event.duration.total)} (${durations.join(', ')}))`)
    }
  }

  return { write }
}

const suite = supposed.Suite({ name: 'MySuite' })
suite.reporterFactory.add(MyReporter)

suite.runner({ cwd: __dirname })
  .run()
```

> Note that if you name your reporter using the convention, `[Anything]Reporter`, you can use it in arguments without the word "Reporter". For instance, since the reporter in the example above is named, "MyReporter", we can use like this: `node tests -r my`. Otherwise, you can always use it by the full name.

### Streaming Output to a File
The following examples assumes you have a `./tests.js` file that executes your tests:

```Shell
$ node tests -r md > tests.md
```

### Adding Information to Report Output (event.log)
Sometimes it's helpful to include context in test output, such as details about the system under test, or the variables that were fed to the system under test. If you'd like reporters that support this feature to print the context inline with the test results, return `{ log: { ... } }` from your test.

```JavaScript
const test = require('supposed')

module.exports = test('when dividing a number by zero', {
  given: () => 42,
  when: (number) => {
    return {
      given: number,
      actual: number / 0
    }
  },
  'it should return Infinity': (then) => (err, { given, actual }) => {
    then.ifError(err)
    then.strictEqual(actual, Infinity)
    return {
      log: {
        given,
        actual
      }
    }
  }
})
```

### Adding Context to Test Events (event.context)
Sometimes it's helpful to include context in the test events _without_ it being added to report output. If you're subscribing to events, or writing your own reporter, and want additional context from a test, return `{ context: { ... } }` from your test.

```JavaScript
const test = require('supposed')

module.exports = test('when dividing a number by zero', {
  given: () => 42,
  when: (number) => {
    return {
      given: number,
      actual: number / 0
    }
  },
  'it should return Infinity': (then) => (err, { given, actual }) => {
    then.ifError(err)
    then.strictEqual(actual, Infinity)
    return {
      context: {
        given,
        actual
      }
    }
  }
})
```

### Programmatic Report Consumption
If you're using this as part of continuous integration, and you don't want the output to be written to `stdout`, you can use the `-q` switch and programmatically handle the results:

```JavaScript
const suite = require('supposed').Suite()

suite.runner().run().then((context) => {
  // do something with the results here
  console.log(context.results)
})
```

## Other

### Writing Your Own Test Runner
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
