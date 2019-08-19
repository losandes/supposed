"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Node, or global
;

(function (root) {
  // eslint-disable-line no-extra-semi
  'use strict';

  var module = {
    factories: {}
  };
  Object.defineProperty(module, 'exports', {
    get: function get() {
      return null;
    },
    set: function set(val) {
      module.factories[val.name] = val.factory;
    },
    // this property should show up when this object's property names are enumerated
    enumerable: true,
    // this property may not be deleted
    configurable: false
  });
  module.exports = {
    name: 'AsyncTest',
    factory: AsyncTestFactory
  };

  function AsyncTestFactory(TestEvent) {
    'use strict'; // {
    //   given: [Function: when],
    //   when: [Function: when],
    //   assertions: [{
    //     behavior: 'when dividing a number by zero, we get Infinity',
    //     test: [Function: we get Infinity]
    //   }]
    // }

    return function AsyncTest(test, config) {
      return function () {
        // we need a Promise wrapper, to timout the test if it never returns
        return new Promise(function (resolve, reject) {
          // run the tests concurrently
          setTimeout(function () {
            // setup the intial context
            var context = new Context({
              test: test,
              config: config,
              timer: setTimeout(function () {
                return reject(new TestEvent({
                  type: TestEvent.types.BROKEN,
                  behavior: test.behavior,
                  error: new Error("Timeout: the test exceeded ".concat(context.config.timeout, " ms"))
                }));
              }, config.timeout),
              err: null // null is the default

            }); // run the flow

            return Promise.resolve(context).then(useNoopsIfSkipped).then(runGiven).then(runWhen).then(checkAssertions).then(function (context) {
              clearTimeout(context.timer);
              return resolve(context.outcomes);
            }).catch(function (err) {
              clearTimeout(context.timer);
              return reject(new TestEvent({
                type: TestEvent.types.BROKEN,
                behavior: test.behavior,
                error: err && err.error ? err.error : err
              }));
            }); // /flow
          }, 0); // /setTimeout
        }); // /outer Promise
      }; // /wrapper
    }; // /AsyncTest

    /**
     * If the test is skipped, sets noops for given and when,
     * otherwise sets given and when to associated test variables
     * @param {Object} context
     */

    function useNoopsIfSkipped(context) {
      if (testIsSkipped(context.test)) {
        // there aren't any tests to run
        // set the when to the noop function
        context.given = noop;
        context.when = noop;
      } else {
        context.given = context.test.given || noop;
        context.when = context.test.when;
      }

      return context;
    }

    function testIsSkipped(test) {
      return test.skipped || // the test isn't skipped, but all of it's assertions are
      test.assertions.filter(function (a) {
        return a.skipped;
      }).length === test.assertions.length;
    }
    /**
     * Runs `given` and passes any output forward
     * @param {Object} context
     */


    function runGiven(context) {
      try {
        var actual = context.given();

        if (actual && typeof actual.then === 'function') {
          return actual.then(function (actual) {
            context.resultOfGiven = actual;
            return context;
          });
        }

        context.resultOfGiven = actual;
        return context;
      } catch (e) {
        context.err = e;
        throw e;
      }
    }
    /**
     * Runs `when` and passes any output forward
     * @param {Object} context
     */


    function runWhen(context) {
      try {
        var actual = context.when(context.resultOfGiven);

        if (actual && typeof actual.then === 'function') {
          return actual.then(function (actual) {
            context.resultOfWhen = actual;
            return context;
          }).catch(function (err) {
            context.err = err;
            return context;
          });
        }

        context.resultOfWhen = actual;
        return context;
      } catch (e) {
        context.err = e;
        return context;
      }
    }
    /**
     * Executes the assertions
     * @param {Object} context
     */


    function checkAssertions(context) {
      var promises = [];
      context.test.assertions.forEach(function (assertion) {
        promises.push(assertOne(assertion, function () {
          if (assertion.test.length > 1) {
            // the assertion accepts all arguments to a single function
            return assertion.test(context.config.assertionLibrary, context.err, context.resultOfWhen);
          }

          var maybeFunc = assertion.test(context.config.assertionLibrary);

          if (typeof maybeFunc === 'function') {
            // the assertion curries: (t) => (err, actual) => { ... }
            return maybeFunc(context.err, context.resultOfWhen);
          }

          return maybeFunc;
        }));
      });
      return Promise.all(promises).then(function (events) {
        events.forEach(function (event) {
          context.outcomes.push(Object.assign({
            behavior: 'anonymous'
          }, event));
        });
        return context;
      });
    } // /checkAssertions

    /**
     * Executes one assertion
     * @param {Object} context
     */


    function assertOne(assertion, test) {
      try {
        if (assertion.skipped) {
          return Promise.resolve(new TestEvent({
            type: TestEvent.types.SKIPPED,
            behavior: assertion.behavior
          }));
        }

        var maybePromise = test();

        if (maybePromise && typeof maybePromise.then === 'function') {
          return maybePromise.then(function () {
            return new TestEvent({
              type: TestEvent.types.PASSED,
              behavior: assertion.behavior
            });
          }).catch(function (err) {
            return new TestEvent({
              type: TestEvent.types.FAILED,
              behavior: assertion.behavior,
              error: err
            });
          });
        }

        return Promise.resolve(new TestEvent({
          type: TestEvent.types.PASSED,
          behavior: assertion.behavior
        }));
      } catch (e) {
        return Promise.resolve(new TestEvent({
          type: TestEvent.types.FAILED,
          behavior: assertion.behavior,
          error: e
        }));
      }
    } // /assertOne

    /**
     * The context for one flow
     * @param {Object} context
     */


    function Context(context) {
      var self = {
        test: context.test,
        config: context.config,
        timer: context.timer,
        given: context.given,
        when: context.when,
        resultOfGiven: context.resultOfGiven,
        resultOfWhen: context.resultOfWhen,
        outcomes: context.outcomes || [],
        err: context.err
      };
      return Object.seal(self);
    } // /Context


    function noop() {}
  } // /module.exports


  'use strict';

  module.exports = {
    name: 'configFactory',
    factory: {
      makeSuiteConfig: makeSuiteConfig
    }
  };

  function makeSuiteConfig(defaults, overrides, reporterFactory) {
    var suiteConfig = {
      timeout: 2000,
      assertionLibrary: defaults.assertionLibrary,
      reporterName: defaults.reporter,
      reporter: defaults.reporter,
      match: defaults.match
    };
    overrides = _objectSpread({}, overrides);
    ['reporter', 'match', 'timeout', 'assertionLibrary'].forEach(function (key) {
      if (overrides[key]) {
        suiteConfig[key] = overrides[key];
      }
    });

    if (typeof suiteConfig.reporter === 'string') {
      // allow overrides to add their own reporter
      // if the reporter is a string, get it from the reporterFactory
      suiteConfig.reporterName = suiteConfig.reporter;
      suiteConfig.reporter = reporterFactory.get(suiteConfig.reporter);
    } else if (overrides.reporter) {
      // the reporter must be a function that was passed in
      suiteConfig.reporterName = suiteConfig.reporter.name || 'CUSTOM';
    }

    suiteConfig.makeTheoryConfig = function (theory) {
      theory = _objectSpread({}, theory);
      return {
        timeout: theory.timeout || suiteConfig.timeout,
        assertionLibrary: theory.assertionLibrary || suiteConfig.assertionLibrary,
        reporter: suiteConfig.reporter
      };
    };

    return suiteConfig;
  }

  'use strict';

  module.exports = {
    name: 'promiseUtils',
    factory: {
      allSettled: allSettled
    }
  };

  function allSettled(tasks, onError) {
    if (!Array.isArray(tasks)) {
      return Promise.reject(new Error('allSettled expects an array of task functions as the first argument'));
    }

    var results = [];

    var addResults = function addResults(result) {
      if (Array.isArray(result)) {
        result.forEach(addOneResult);
      } else {
        addOneResult(result);
      }
    };

    var addOneResult = function addOneResult(result) {
      if (result.type === 'BROKEN') {
        onError && onError(result);
      }

      results.push(result);
    };

    tasks = Object.assign([], tasks);

    function next() {
      var task = tasks.shift();

      if (!task) {
        // we're at the end
        return Promise.resolve(results);
      }

      return task().then(addResults).catch(addResults).then(next);
    }

    return next();
  }

  'use strict';

  var givenSynonyms = ['given', 'arrange'];
  var whenSynonyms = ['when', 'act', 'topic'];
  var config = ['timeout', 'assertionLibrary', 'reporter'];
  var actions = givenSynonyms.concat(whenSynonyms, config);
  var tapSkipPattern = /^# SKIP /i;
  var tapSkipOrTodoPattern = /(^# SKIP )|(^# TODO )/i;
  module.exports = {
    name: 'TestBatch',
    factory: TestBatch
  };

  function TestBatch(tests) {
    var parsed = [];
    Object.keys(tests).forEach(function (key) {
      parsed = parsed.concat(parseOne(key, tests[key]));
    });
    return parsed;
  }

  function parseOne(behavior, node, given, when, skipped, timeout, assertionLib) {
    var parent;
    var passes = [];
    timeout = timeout || node.timeout;
    assertionLib = assertionLib || node.assertionLibrary;
    skipped = skipped || node.skipped;
    parent = new Pass(behavior, node, given, when, skipped, timeout, assertionLib);

    if (Array.isArray(parent.assertions) && parent.assertions.length) {
      passes.push(parent);
    }

    Object.keys(node).filter(function (childKey) {
      return _typeof(node[childKey]) === 'object';
    }).map(function (childKey) {
      var childBehavior = concatBehavior(behavior, childKey);
      return parseOne(childBehavior, node[childKey], parent.given, parent.when, // skipping favors the parent over the child
      parent.skipped || isSkipped(childKey), // timeout and assertion lib favor the child over the parent
      node[childKey].timeout || parent.timeout, node[childKey].assertionLibrary || parent.assertionLibrary);
    }).forEach(function (mappedPasses) {
      mappedPasses.filter(function (mappedPass) {
        return Array.isArray(mappedPass.assertions) && mappedPass.assertions.length;
      }).forEach(function (mappedPass) {
        passes.push(mappedPass);
      });
    });
    return passes;
  }

  function getGiven(node) {
    return node.given || node.arrange;
  }

  function getWhen(node) {
    return node.when || node.act || node.topic;
  }

  function getAssertions(behavior, node, skipped) {
    if (isAssertion(node, behavior)) {
      return [{
        behavior: behavior,
        test: node,
        skipped: skipped
      }];
    }

    return Object.keys(node).filter(function (key) {
      return isAssertion(node[key], key);
    }).map(function (key) {
      return {
        behavior: concatBehavior(behavior, key),
        test: node[key],
        skipped: skipped || isSkipped(key)
      };
    });
  }

  function isAssertion(node, key) {
    return typeof node === 'function' && actions.indexOf(key) === -1;
  }

  function isSkipped(behavior) {
    if (behavior && (isCommentedOut(behavior) || isTapSkipped(behavior))) {
      return true;
    }

    return false;
  }

  function isCommentedOut(behavior) {
    return behavior.length >= 2 && behavior.trim().substring(0, 2) === '//';
  }

  function isTapSkipped(behavior) {
    return tapSkipOrTodoPattern.test(behavior);
  }

  function trimBehavior(behavior) {
    if (isCommentedOut(behavior)) {
      // remove the comments
      return behavior.substring(2).trim();
    } else if (tapSkipPattern.test(behavior)) {
      // remove the directive - it will be replaced in the TAP output
      return behavior.substring(7).trim();
    } else {
      return behavior.trim();
    }
  }

  function concatBehavior(behavior, key) {
    return "".concat(trimBehavior(behavior), ", ").concat(trimBehavior(key));
  }

  function Pass(behavior, node, given, when, skipped, timeout, assertionLib) {
    var skip = skipped || isSkipped(behavior);
    var assertions = getAssertions(behavior, node, skip, timeout);
    var arrange = getGiven(node) || given;
    var act = getWhen(node) || when;

    if (arrange && !act) {
      act = arrange;
      arrange = null;
    }

    return {
      behavior: behavior,
      given: arrange,
      when: act,
      assertions: assertions,
      skipped: skip,
      timeout: timeout,
      assertionLibrary: assertionLib
    };
  }

  'use strict';

  var TYPE_EXPRESSION = /(^START$)|(^START_TEST$)|(^PASSED$)|(^SKIPPED$)|(^FAILED$)|(^BROKEN$)|(^END$)|(^UNKNOWN$)/;

  var TestEvent = function TestEvent(result) {
    var self = {};
    result = Object.assign({}, result);
    self.type = getType(result.type);

    if (result.behavior) {
      self.behavior = result.behavior;
    }

    if (result.error) {
      self.error = result.error;
    }

    if (result.plan) {
      self.plan = result.plan;
    }

    return Object.freeze(self);
  };

  TestEvent.types = {
    START: 'START',
    START_TEST: 'START_TEST',
    PASSED: 'PASSED',
    SKIPPED: 'SKIPPED',
    FAILED: 'FAILED',
    BROKEN: 'BROKEN',
    END: 'END',
    UNKNOWN: 'UNKNOWN'
  };
  TestEvent.start = new TestEvent({
    type: TestEvent.types.START
  });
  TestEvent.startTest = new TestEvent({
    type: TestEvent.types.START_TEST
  });
  TestEvent.end = new TestEvent({
    type: TestEvent.types.END
  });

  function getType(type) {
    if (TYPE_EXPRESSION.test(type)) {
      return type;
    }

    return TestEvent.types.UNKNOWN;
  }

  module.exports = {
    name: 'TestEvent',
    factory: TestEvent
  };
  module.exports = {
    name: 'Suite',
    factory: Suite
  };

  function Suite(DefaultRunner, DefaultDiscoverer, TestBatch, AsyncTest, TestEvent, configFactory, configDefaults, reporterFactory, reporters) {
    'use strict';
    /**
     * The test library
     * @param {Object} suiteConfig : optional configuration
    */

    function Suite(suiteConfig) {
      var config = configFactory.makeSuiteConfig(configDefaults, suiteConfig, reporterFactory);
      var runner = new DefaultRunner(config);

      function normalizeBatch(behaviorOrBatch, sut) {
        if (_typeof(behaviorOrBatch) === 'object') {
          return Promise.resolve(behaviorOrBatch);
        } else if (typeof behaviorOrBatch === 'string') {
          var t = {};
          t[behaviorOrBatch] = typeof sut === 'function' ? {
            '': sut
          } : sut;
          return Promise.resolve(t);
        } else if (typeof behaviorOrBatch === 'function') {
          var _t = {
            '': behaviorOrBatch
          };
          return Promise.resolve(_t);
        } else {
          return Promise.reject(new Error('An invalid test was found: a test or batch of tests is required'));
        }
      } // /normalizebatch


      function mapToTests(batch) {
        var processed = new TestBatch(batch).filter(byMatcher);
        return {
          batch: processed,
          tests: processed.map(function (theory) {
            return new AsyncTest(theory, config.makeTheoryConfig(theory));
          })
        };
      } // /mapToTests


      function byMatcher(theory) {
        if (!config.match) {
          return true;
        }

        for (var i = 0; i < theory.assertions.length; i += 1) {
          if (config.match.test(theory.assertions[i].behavior)) {
            return true;
          }
        }
      } // examples:
      // test('when dividing a number by zero', {
      //   when: resolve => { resolve(42 / 0) },
      //   'we get Infinity': (t, outcome) => {
      //     t.equal(outcome, Infinity)
      //   }
      // })
      //
      // OR
      //
      // test({
      //   'when dividing a number by zero': {
      //     when: resolve => { resolve(42 / 0) },
      //     'we get Infinity': (t, outcome) => {
      //       t.equal(outcome, Infinity)
      //     }
      //   }
      // })


      function test(behaviorOrBatch, sut) {
        return normalizeBatch(behaviorOrBatch, sut).then(mapToTests).then(runner.makePlan).then(runner.run).then(runner.report).then(runner.prepareOutput).catch(function (err) {
          console.log();
          console.log(err);
          console.log();
          return Promise.reject(err);
        });
      }
      /**
      // Make a newly configured suite
      */


      test.Suite = Suite;

      test.printSummary = function () {
        config.reporter.report(TestEvent.end);
      };

      test.getTotals = function () {
        return config.reporter.getTotals();
      };

      test.suiteName = config.name;

      test.runner = function (options) {
        return new DefaultDiscoverer(Object.assign({
          suite: test
        }, options));
      };

      test.reporters = reporters;
      test.config = config;
      Suite.suites.push(test);
      return test;
    }

    Suite.suites = [];
    return Suite;
  }

  'use strict';

  module.exports = {
    name: 'BrowserConsolePrinter',
    factory: BrowserConsolePrinter
  };

  function BrowserConsolePrinter(styles, SYMBOLS) {
    var specCount = 0;
    var printerOutput = [];

    var print = function print(line) {
      printerOutput.push(line);
      console.log(line);
    };

    print.start = function (message) {
      specCount += 1;

      if (specCount === 1) {
        print(message);
      }
    };

    print.startTest = function (message) {
      /* suppress */
    };

    print.success = function (behavior) {
      print(SYMBOLS.passed + behavior);
    };

    print.skipped = function (behavior) {
      print(SYMBOLS.skipped + behavior);
    };

    print.failed = function (behavior, e) {
      print(SYMBOLS.failed + behavior);

      if (e && e.expected && e.actual) {
        print("    expected: ".concat(e.expected, "    actual: ").concat(e.actual));
      }

      if (e) {
        print(e);
        print('');
      }
    };

    print.broken = print.failed;

    print.info = function (behavior, e) {
      print(SYMBOLS.info + behavior);

      if (e && e.expected && e.actual) {
        print("    expected: ".concat(e.expected, "    actual: ").concat(e.actual));
      }

      print(e);
      print('');
    };

    print.totals = function (totals) {
      print('  total: ' + totals.total);
      print('  passed: ' + totals.passed);
      print('  failed: ' + totals.failed + totals.broken);
      print('  skipped: ' + totals.skipped);
      print('  duration: ' + (totals.endTime - totals.startTime) / 1000 + 's');
    };

    print.end = function (message) {
      print(message);
    };

    return Object.freeze({
      name: 'BROWSER_CONSOLE',
      print: print,
      newLine: styles && typeof styles.newLine === 'function' ? styles.newLine() : '\n',
      getOutput: function getOutput() {
        return printerOutput.join('\n');
      }
    });
  }

  module.exports = {
    name: 'consoleStyles',
    factory: Styles
  };

  function Styles(options) {
    'use strict';

    var move = function move(control) {
      return function (increment) {
        increment = isNaN(increment) ? 0 : Math.max(Math.floor(increment), 0);
        return increment ? "\x1B[".concat(increment).concat(control) : '';
      };
    };

    var self = {
      newLine: function newLine() {
        return '\n';
      },
      up: move('A'),
      down: move('B'),
      right: move('C'),
      left: move('D'),
      hide: function hide() {
        return "\x1B[?25l";
      },
      show: function show() {
        return "\x1B[?25h";
      },
      deleteLine: function deleteLine() {
        return "\x1B[2K";
      },
      beginningOfLine: function beginningOfLine() {
        return "\x1B[0G";
      },
      clear: function clear() {
        return "".concat(self.deleteLine).concat(self.beginningOfLine);
      }
    };
    var STYLES = [{
      name: 'reset',
      value: [0, 0]
    }, {
      name: 'bold',
      value: [1, 22]
    }, {
      name: 'italic',
      value: [3, 23]
    }, {
      name: 'underline',
      value: [4, 24]
    }, {
      name: 'dim',
      value: [2, 22]
    }, {
      name: 'hidden',
      value: [8, 28]
    }, {
      name: 'strikethrough',
      value: [9, 29]
    }, {
      name: 'inverse',
      value: [7, 27]
    }, {
      name: 'black',
      value: [30, 39]
    }, {
      name: 'blue',
      value: [34, 39]
    }, {
      name: 'cyan',
      value: [96, 39]
    }, {
      name: 'green',
      value: [32, 39]
    }, {
      name: 'green-hi',
      value: [92, 32]
    }, {
      name: 'grey',
      value: [90, 39]
    }, {
      name: 'magenta',
      value: [35, 39]
    }, {
      name: 'red',
      value: [31, 39]
    }, {
      name: 'white',
      value: [37, 39]
    }, {
      name: 'yellow',
      value: [33, 39]
    }, {
      name: 'bgBlack',
      value: [40, 49]
    }, {
      name: 'bgRed',
      value: [41, 49]
    }, {
      name: 'bgGreen',
      value: [42, 49]
    }, {
      name: 'bgYellow',
      value: [43, 49]
    }, {
      name: 'bgBlue',
      value: [44, 49]
    }, {
      name: 'bgMagenta',
      value: [45, 49]
    }, {
      name: 'bgCyan',
      value: [46, 49]
    }, {
      name: 'bgWhite',
      value: [47, 49]
    }];
    options = Object.assign({}, options);
    STYLES.forEach(function (style) {
      self[style.name] = function (input) {
        if (options.noColor) {
          return input;
        }

        return "\x1B[".concat(style.value[0], "m").concat(input, "\x1B[").concat(style.value[1], "m");
      };
    });
    Object.freeze(self);
    return self;
  } // /Styles


  'use strict';

  module.exports = {
    name: 'DefaultReporter',
    factory: DefaultReporterFactory
  };

  function DefaultReporterFactory(Reporter) {
    return function (printerFactory, TestEvent) {
      var totals = {
        total: 0,
        passed: 0,
        skipped: 0,
        failed: 0,
        broken: 0,
        startTime: null,
        endTime: null
      };
      var results = [];

      var __printer;

      var printer = function printer() {
        if (__printer) {
          return __printer;
        }

        __printer = printerFactory();
        return __printer;
      };

      function report(result) {
        if (Array.isArray(result)) {
          return result.forEach(reportOne);
        }

        return reportOne(result);
      }

      function reportOne(result) {
        switch (result.type) {
          case TestEvent.types.START:
            printer().print.start('Running tests...' + printer().newLine); // set the start time, if it isn't already set

            totals.startTime = totals.startTime || new Date();
            break;

          case TestEvent.types.START_TEST:
            printer().print.startTest(result.plan);
            break;

          case TestEvent.types.PASSED:
            totals.passed += 1;
            printer().print.success(result.behavior);
            results.push(result);
            break;

          case TestEvent.types.SKIPPED:
            totals.skipped += 1;
            printer().print.skipped(result.behavior);
            results.push(result);
            break;

          case TestEvent.types.FAILED:
            totals.failed += 1;
            printer().print.failed(result.behavior, result.error);
            results.push(result);
            break;

          case TestEvent.types.BROKEN:
            totals.broken += 1;
            printer().print.broken(result.behavior, result.error);
            results.push(result);
            break;

          case TestEvent.types.END:
            totals.endTime = new Date();
            totals.total = totals.passed + totals.skipped + totals.failed + totals.broken;
            printer().print.totals(totals);
            break;
        }
      }

      return new Reporter({
        report: report,
        getTotals: function getTotals() {
          var output = Object.assign({}, totals);
          output.total = output.passed + output.skipped + output.failed + output.broken;
          return output;
        },
        getResults: function getResults() {
          return results;
        },
        getPrinterOutput: function getPrinterOutput() {
          return typeof printer().getOutput === 'function' ? printer().getOutput() : '';
        }
      });
    };
  }

  'use strict';

  module.exports = {
    name: 'DomPrinter',
    factory: DomPrinter
  };

  function makeTestElement(input) {
    var icon = document.createElement('td');
    icon.append(input.symbol);
    icon.setAttribute('class', 'supposed_icon supposed_color_' + input.status);
    var behavior = document.createElement('td');
    behavior.setAttribute('class', 'supposed_behavior supposed_status_' + input.status);

    if (input.status === 'stack') {
      var lines = input.line.split('\n');
      lines.forEach(function (ln) {
        behavior.append(ln);
        behavior.appendChild(document.createElement('br'));
      });
    } else {
      behavior.append(input.line);
    }

    var row = document.createElement('tr');
    row.setAttribute('class', 'supposed_test supposed_status_' + input.status);
    row.appendChild(icon);
    row.appendChild(behavior);
    return row;
  }

  function makeSummaryElement(input) {
    var element = document.createElement('span');
    element.append(input.name + ':' + input.value);
    element.setAttribute('class', 'supposed_summary_item supposed_summary_' + input.name + ' supposed_color_' + input.color);
    return element;
  }

  function DomPrinter(styles, SYMBOLS) {
    var specCount = 0;
    var printerOutput = [];
    var reportDiv = document.createElement('div');
    reportDiv.setAttribute('class', 'supposed_report');
    document.body.appendChild(reportDiv);
    var reportTable = document.createElement('table');
    reportTable.setAttribute('class', 'supposed_report');
    reportDiv.appendChild(reportTable);

    var print = function print(status, line) {
      if (line) {
        printerOutput.push(line);
        reportTable.appendChild(makeTestElement({
          status: status,
          symbol: SYMBOLS[status] || '   ',
          line: line
        }));
      }
    };

    print.start = function (message) {
      specCount += 1;

      if (specCount === 1) {
        print(message);
      }
    };

    print.startTest = function (message) {
      /* suppress */
    };

    print.success = function (behavior) {
      print('passed', behavior);
    };

    print.skipped = function (behavior) {
      print('skipped', behavior);
    };

    print.failed = function (behavior, e) {
      print('failed', behavior);

      if (e && e.expected && e.actual) {
        print('info', '    expected: '.concat(e.expected, '    actual: ').concat(e.actual));
      }

      if (e && e.stack) {
        print('stack', e.stack);
      } else if (e) {
        print('stack', e.message);
      }
    };

    print.broken = print.failed;

    print.info = function (behavior, e) {
      print('info', behavior);

      if (e && e.expected && e.actual) {
        print('info', '    expected: '.concat(e.expected, '    actual: ').concat(e.actual));
      }

      if (e && e.stack) {
        print('stack', e.stack);
      } else if (e) {
        print('stack', e.message);
      }
    };

    print.totals = function (totals) {
      var total;

      if (totals.failed > 0) {
        total = {
          name: 'total',
          value: totals.total,
          color: 'failed'
        };
      } else {
        total = {
          name: 'total',
          value: totals.total,
          color: 'passed'
        };
      }

      var summary = document.createElement('div');
      summary.setAttribute('class', 'supposed_summary');
      summary.appendChild(makeSummaryElement(total));
      summary.appendChild(makeSummaryElement({
        name: 'passed',
        value: totals.passed,
        color: 'passed'
      }));
      summary.appendChild(makeSummaryElement({
        name: 'failed',
        value: totals.failed,
        color: totals.failed > 0 ? 'failed' : 'info'
      }));
      summary.appendChild(makeSummaryElement({
        name: 'skipped',
        value: totals.skipped,
        color: totals.skipped > 0 ? 'skipped' : 'info'
      }));
      summary.appendChild(makeSummaryElement({
        name: 'duration',
        value: (totals.endTime - totals.startTime) / 1000 + 's',
        color: 'info'
      }));
      reportDiv.prepend(summary);
    };

    print.end = function (message) {
      print('info', message);
    };

    return Object.freeze({
      name: 'DOM',
      print: print,
      newLine: styles && typeof styles.newLine === 'function' ? styles.newLine() : '\n',
      getOutput: function getOutput() {
        return printerOutput.join('\n');
      }
    });
  } // inspired by [karma-nyan-reporter](https://github.com/dgarlitt/karma-nyan-reporter)


  'use strict';

  module.exports = {
    name: 'NyanPrinter',
    factory: NyanPrinterFactory
  };

  function NyanPrinterFactory(streamPrinter, styles) {
    'use strict';

    var stats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
    var printerOutput = [];

    var print = function print(line) {
      streamPrinter.print(line);
    };

    var _ref = new NyanPrinter({
      print: print,
      styles: styles,
      windowSize: streamPrinter.getWindowSize()
    }),
        draw = _ref.draw;

    print.start = function (message) {
      draw.begin(stats);
      printerOutput.push({
        message: message
      });
    };

    print.startTest = function (message) {
      /* suppress */
    };

    print.success = function (behavior) {
      stats.success += 1;
      stats.total += 1;
      draw(stats);
      printerOutput.push({
        behavior: behavior,
        status: 'SUCCESS'
      });
    };

    print.skipped = function (behavior) {
      stats.skipped += 1;
      stats.total += 1;
      draw(stats);
      printerOutput.push({
        behavior: behavior,
        status: 'SKIPPED'
      });
    };

    print.failed = function (behavior, e) {
      stats.failed += 1;
      stats.total += 1;
      draw(stats);
      var err = "".concat(styles.newLine()).concat(styles.bgRed(styles.black(' ' + behavior))).concat(styles.newLine()).concat(styles.newLine());

      if (e && e.expected && e.actual) {
        err += "    expected: ".concat(styles.green(e.expected), "    actual: ").concat(styles.red(e.actual)).concat(styles.newLine()).concat(styles.newLine());
      }

      if (e) {
        err += "".concat(e).concat(styles.newLine());
      }

      stats.errors.push(err);
      printerOutput.push({
        behavior: behavior,
        err: err,
        status: 'FAILED'
      });
    };

    print.broken = print.failed;

    print.info = function (behavior, e) {
      printerOutput.push({
        behavior: behavior,
        e: e,
        status: 'INFO'
      });
    };

    print.totals = function (totals) {
      var output = styles.newLine() + '  total: ' + styles.cyan(totals.total);
      output += "  passed: ".concat(styles.green(totals.passed));
      output += "  failed: ".concat(styles.red(totals.failed + totals.broken));
      output += "  skipped: ".concat(styles.yellow(totals.skipped));
      output += "  duration: ".concat((totals.endTime - totals.startTime) / 1000, "s").concat(styles.newLine());
      print(output);
      stats.errors.forEach(print);
      draw.end(stats);
    };

    print.end = function (message) {
      print(message);
    };

    return Object.freeze({
      name: 'NYAN',
      print: print,
      newLine: styles.newLine(),
      getOutput: function getOutput() {
        return printerOutput.join(styles.newLine());
      }
    });
  }

  function NyanPrinter(options) {
    'use strict';

    var initialized = false;
    var print = options.print,
        styles = options.styles,
        windowSize = options.windowSize;

    var _ref2 = new Rainbowifier(),
        rainbowify = _ref2.rainbowify;

    var width = windowSize.width * 0.75 | 0;
    var numberOfLines = 4;
    var UP = styles.up(numberOfLines);
    var nyanCatWidth = 11;
    var scoreboardWidth = 5;
    var trajectoryWidthMax = width - nyanCatWidth;

    var trajectories = _toConsumableArray(Array(numberOfLines)).map(function () {
      return [];
    });

    var tick = 0;

    var drawScoreboard = function drawScoreboard(stats) {
      print(" ".concat(styles.cyan(stats.total)).concat(styles.newLine()));
      print(" ".concat(styles.green(stats.success)).concat(styles.newLine()));
      print(" ".concat(styles.red(stats.failed)).concat(styles.newLine()));
      print(" ".concat(styles.yellow(stats.skipped)).concat(styles.newLine()));
    };

    var drawRainbow = function drawRainbow() {
      trajectories.forEach(function (line) {
        print("\x1B[".concat(scoreboardWidth, "C").concat(line.join('')).concat(styles.newLine()));
      });
    };

    var appendRainbow = function appendRainbow() {
      var segment = rainbowify(tick ? '_' : '-');

      for (var i = 0; i < numberOfLines; i++) {
        var trajectory = trajectories[i];

        if (trajectory.length >= trajectoryWidthMax) {
          trajectory.shift();
        }

        trajectory.push(segment);
      }
    };

    var face = function face(stats) {
      if (stats.failed) {
        return '( x .x)';
      } else if (stats.skipped) {
        return '( o .o)';
      } else if (stats.success) {
        return '( ^ .^)';
      } else {
        return '( - .-)';
      }
    };

    var drawNyanCat = function drawNyanCat(stats) {
      var startWidth = scoreboardWidth + trajectories[0].length;
      var color = "\x1B[".concat(startWidth, "C");
      print("".concat(color, "_,------,").concat(styles.newLine()));

      (function () {
        var padding = tick ? '  ' : '   ';
        print("".concat(color, "_|").concat(padding, "/\\_/\\ ").concat(styles.newLine()));
      })();

      (function () {
        var padding = tick ? '_' : '__';
        var tail = tick ? '~' : '^';
        print("".concat(color).concat(tail, "|").concat(padding).concat(face(stats), " ").concat(styles.newLine()));
      })();

      (function () {
        var padding = tick ? ' ' : '  ';
        print("".concat(color).concat(padding, "  \"\"  \"\" ").concat(styles.newLine()));
      })();
    };

    var fillWithNewLines = function fillWithNewLines(startFrom) {
      for (var i = startFrom || 0; i < numberOfLines + 1; i++) {
        print(styles.newLine());
      }
    };

    var draw = function draw(stats) {
      fillWithNewLines(numberOfLines + 1);
      print(UP);
      appendRainbow();
      drawScoreboard(stats);
      fillWithNewLines(numberOfLines + 1);
      print(UP);
      drawRainbow();
      print(UP);
      drawNyanCat(stats);
      tick = !tick;
    };

    draw.begin = function (stats) {
      if (!initialized) {
        initialized = true;
        print(styles.newLine());
        print(styles.hide());
        drawScoreboard(stats);
      }
    };

    draw.end = function (stats) {
      print(styles.show());
    };

    return {
      draw: draw
    };
  }
  /*
  // Generate rainbow colors
  */


  function generateColors() {
    var colors = [];

    for (var i = 0; i < 6 * 7; i++) {
      var pi3 = Math.floor(Math.PI / 3);
      var n = i * (1.0 / 6);
      var r = Math.floor(3 * Math.sin(n) + 3);
      var g = Math.floor(3 * Math.sin(n + 2 * pi3) + 3);
      var b = Math.floor(3 * Math.sin(n + 4 * pi3) + 3);
      colors.push(36 * r + 6 * g + b + 16);
    }

    return colors;
  }

  function Rainbowifier() {
    var colorIndex = 0;
    var rainbowColors = generateColors();

    var rainbowify = function rainbowify(input) {
      var color = rainbowColors[colorIndex % rainbowColors.length];
      colorIndex += 1;
      return "\x1B[38;5;".concat(color, "m").concat(input, "\x1B[0m");
    };

    var reset = function reset() {
      colorIndex = 0;
    };

    return {
      rainbowify: rainbowify,
      reset: reset
    };
  }

  'use strict';

  module.exports = {
    name: 'QuietPrinter',
    factory: QuietPrinter
  };

  function QuietPrinter(styles) {
    var printerOutput = [];

    var print = function print(line) {
      printerOutput.push(line);
      /* suppressed */
    };

    print.start = print;
    print.startTest = print;
    print.success = print;
    print.skipped = print;
    print.failed = print;
    print.broken = print;
    print.info = print;
    print.totals = print;
    print.end = print;
    return Object.freeze({
      name: 'QUIET',
      print: print,
      newLine: styles && typeof styles.newLine === 'function' ? styles.newLine() : '\n',
      getOutput: function getOutput() {
        return printerOutput.join('\n');
      }
    });
  }

  'use strict';

  module.exports = {
    name: 'TapPrinter',
    factory: TapPrinter // http://testanything.org/tap-version-13-specification.html

  };

  function TapPrinter(streamPrinter) {
    var printedVersion = false;
    var testCount = 0;
    var print = streamPrinter.print;

    print.start = function () {
      if (!printedVersion) {
        printedVersion = true;
        print('TAP version 13');
      }
    };

    print.startTest = function (plan) {// do nothing
    };

    print.success = function (behavior) {
      testCount += 1;
      print("ok ".concat(testCount, " - ").concat(behavior));
    };

    print.skipped = function (behavior) {
      testCount += 1;
      print("ok ".concat(testCount, " # SKIP ").concat(behavior));
    };

    print.failed = function (behavior, e) {
      testCount += 1;
      print("not ok ".concat(testCount, " - ").concat(behavior));
      optionallyPrintError(e, 'fail');
    };

    print.broken = function (behavior, e) {
      testCount += 1;
      print("not ok ".concat(testCount, " - ").concat(behavior));
      optionallyPrintError(e, 'broken'); // TODO: I'm not sure there is ever a reason to print "bail out!" with this test runner
      // It might be something we tie to `given`?

      print("bail out! ".concat(e && e.message));
    };

    print.info = function (behavior, e) {
      print("# ".concat(behavior, " \n"));
      optionallyPrintError(e, 'info');
    };

    function optionallyPrintError(e, severity) {
      if (e) {
        print('  ---');
        print("  message: '".concat(e.message, "'"));
        print("  severity: ".concat(severity));
        print('  data:');

        if (e.expected && e.actual) {
          print("    got: ".concat(e.actual));
          print("    expect: ".concat(e.expected));
        }

        if (e.stack) {
          var stack = e.stack.replace(/\s{4}at/g, '      at');
          print("    stack: ".concat(stack));
        }

        print('  ...');
      }
    }

    print.totals = function (totals) {
      print("1..".concat(totals.total));
    };

    print.end = function () {
      print(streamPrinter.newLine);
    };

    return Object.freeze({
      print: print,
      newLine: streamPrinter.newLine
    });
  }

  'use strict';

  module.exports = {
    name: 'Reporter',
    factory: Reporter
  };

  function Reporter(reporter) {
    return Object.assign({
      report: function report() {},
      getTotals: function getTotals() {},
      getResults: function getResults() {},
      getPrinterOutput: function getPrinterOutput() {}
    }, reporter);
  }

  module.exports = {
    name: 'ReporterFactory',
    factory: ReporterFactory
  };

  function ReporterFactory(_ref3) {
    var TestEvent = _ref3.TestEvent,
        DefaultPrinter = _ref3.DefaultPrinter,
        ConsolePrinter = _ref3.ConsolePrinter,
        TapPrinter = _ref3.TapPrinter,
        BriefPrinter = _ref3.BriefPrinter,
        QuietPrinter = _ref3.QuietPrinter,
        StreamPrinter = _ref3.StreamPrinter,
        NyanPrinter = _ref3.NyanPrinter,
        DomPrinter = _ref3.DomPrinter,
        DefaultReporter = _ref3.DefaultReporter,
        Reporter = _ref3.Reporter,
        consoleStyles = _ref3.consoleStyles;
    var reporters = {
      BLOCK: 'BLOCK',
      BRIEF: 'BRIEF',
      CONSOLE: 'CONSOLE',
      DEFAULT: 'DEFAULT',
      DOM: 'DOM',
      NYAN: 'NYAN',
      QUIET: 'QUIET',
      QUIET_TAP: 'QUIET_TAP',
      TAP: 'TAP'
    };
    var SYMBOLS = {
      passed: consoleStyles.green('✓ '),
      // heavy-check: '✔',
      failed: consoleStyles.red('✗ '),
      // heavy-x '✘',
      skipped: consoleStyles.yellow('⸕ '),
      info: consoleStyles.cyan('→ ')
    };
    var BLOCKS = {
      passed: consoleStyles.bgGreen(consoleStyles.black('  PASS  ')),
      failed: consoleStyles.bgRed(consoleStyles.black('  FAIL  ')),
      skipped: consoleStyles.bgYellow(consoleStyles.black('  SKIP  ')),
      info: consoleStyles.bgCyan(consoleStyles.black('  INFO  '))
    };
    return {
      get: function get(name) {
        switch ("".concat(name).toUpperCase()) {
          case reporters.CONSOLE:
            return new DefaultReporter(function () {
              return new ConsolePrinter(consoleStyles, SYMBOLS);
            }, TestEvent);

          case reporters.NYAN:
            return new DefaultReporter(function () {
              return new NyanPrinter(new StreamPrinter({
                tail: ''
              }), consoleStyles);
            }, TestEvent);

          case reporters.TAP:
            return new DefaultReporter(function () {
              return new TapPrinter(new StreamPrinter());
            }, TestEvent);

          case reporters.DOM:
            return new DefaultReporter(function () {
              return new DomPrinter(consoleStyles, BLOCKS);
            }, TestEvent);

          case reporters.QUIET_TAP:
            return new DefaultReporter(function () {
              return new TapPrinter(new QuietPrinter(consoleStyles));
            }, TestEvent);

          case reporters.BRIEF:
            return new DefaultReporter(function () {
              return new BriefPrinter(new ConsolePrinter(consoleStyles, SYMBOLS));
            }, TestEvent);

          case reporters.QUIET:
            return new DefaultReporter(function () {
              return new QuietPrinter(consoleStyles);
            }, TestEvent);

          case reporters.BLOCK:
            return new DefaultReporter(function () {
              return new ConsolePrinter(consoleStyles, BLOCKS);
            }, TestEvent);

          default:
            return new DefaultReporter(function () {
              return new DefaultPrinter(consoleStyles, SYMBOLS);
            }, TestEvent);
        }
      },
      make: function make(reporter) {
        return new Reporter(reporter);
      },
      types: reporters
    };
  }

  module.exports = {
    name: 'DefaultRunner',
    factory: DefaultRunner
  };

  function DefaultRunner(TestEvent, promiseUtils) {
    return function (config) {
      return {
        makePlan: makePlan,
        run: run,
        report: report,
        prepareOutput: prepareOutput
      };

      function makePlan(context) {
        var count = 0;
        context.batch.forEach(function (item) {
          count += item.assertions.length;
        });
        context.plan = {
          count: count
        };
        return context;
      } // /makePlan


      function run(context) {
        config.reporter.report(TestEvent.start);
        return promiseUtils.allSettled(context.tests).then(function (results) {
          context.results = results;
          return context;
        });
      } // /run


      function report(context) {
        // TODO: reporting all at once was necessary to format the TAP output.
        // For other reporters, we may want to report earlier - so there's a better feed
        // It could be similar to the onError function that gets passed to allSettled
        config.reporter.report(new TestEvent({
          type: TestEvent.types.START_TEST,
          plan: context.plan
        }));
        config.reporter.report(context.results);
        return Promise.resolve(context.results);
      } // /report


      function prepareOutput(results) {
        var reporterTotals = Object.assign({}, config.reporter.getTotals());
        var totals = {
          total: results.length,
          passed: 0,
          skipped: 0,
          failed: 0,
          broken: 0,
          startTime: reporterTotals.startTime,
          endTime: reporterTotals.endTime
        };
        results.forEach(function (result) {
          switch (result.type) {
            case TestEvent.types.PASSED:
              totals.passed += 1;
              break;

            case TestEvent.types.SKIPPED:
              totals.skipped += 1;
              break;

            case TestEvent.types.FAILED:
              totals.failed += 1;
              break;

            case TestEvent.types.BROKEN:
              totals.broken += 1;
              break;
          }
        });
        return Promise.resolve({
          results: results,
          totals: totals
        });
      } // /prepareOutput

    }; // /DefaultRunner
  } // /module.exports
  // resolve the dependency graph


  ;

  (function () {
    var AsyncTest = module.factories.AsyncTest(module.factories.TestEvent);
    var DefaultRunner = module.factories.DefaultRunner(module.factories.TestEvent, module.factories.promiseUtils);
    var DefaultReporter = module.factories.DefaultReporter(module.factories.Reporter);
    var consoleStyles = module.factories.consoleStyles({
      noColor: true
    });
    var reporterFactory = module.factories.ReporterFactory({
      TestEvent: module.factories.TestEvent,
      DefaultPrinter: module.factories.DomPrinter,
      DomPrinter: module.factories.DomPrinter,
      ConsolePrinter: module.factories.BrowserConsolePrinter,
      TapPrinter: module.factories.TapPrinter,
      QuietPrinter: module.factories.QuietPrinter,
      DefaultReporter: DefaultReporter,
      Reporter: module.factories.Reporter,
      consoleStyles: consoleStyles,
      StreamPrinter: function StreamPrinter() {
        return {
          print: console.log,
          newLine: '\n',
          getWindowSize: function getWindowSize() {
            return document.body.clientWidth;
          }
        };
      },
      // not implemented
      BriefPrinter: function BriefPrinter() {
        throw new Error('Not Implemented');
      },
      NyanPrinter: function NyanPrinter() {
        throw new Error('Not Implemented');
      }
    });
    var reporters = {
      console: reporterFactory.get('CONSOLE'),
      default: reporterFactory.get('DEFAULT'),
      dom: reporterFactory.get('DOM'),
      quiet: reporterFactory.get('QUIET'),
      quietTap: reporterFactory.get('QUIET_TAP'),
      tap: reporterFactory.get('TAP')
    };
    var configDefaults = {
      assertionLibrary: {},
      reporter: 'DefaultBrowserPrinter',
      match: null
    };
    var Suite = new module.factories.Suite(DefaultRunner, null, // DefaultDiscoverer,
    module.factories.TestBatch, AsyncTest, module.factories.TestEvent, module.factories.configFactory, configDefaults, reporterFactory, reporters);
    /**
     * export a default Suite, so consumers don't have to construct anything
     * to use this library. Suite has a `Suite` property on it, so consumers
     * can customize it if they choose to
     */

    root.supposed = Suite();
    root.supposedFactories = module.factories;
  })(); // we don't need these anymore


  delete module.factories;
})(window);