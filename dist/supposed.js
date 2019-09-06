"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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
      module.factories["".concat(val.name, "Factory")] = val.factory;
    },
    // this property should show up when this object's property names are enumerated
    enumerable: true,
    // this property may not be deleted
    configurable: false
  });
  module.exports = {
    name: 'allSettled',
    factory: function factory() {
      'use strict';

      function allSettled(promises) {
        return Promise.all(promises.map(function (promise) {
          return new Promise(function (resolve) {
            try {
              promise.then(function (value) {
                resolve({
                  status: 'fullfilled',
                  value: value
                });
              }).catch(function (err) {
                resolve({
                  status: 'rejected',
                  reason: err
                });
              });
            } catch (err) {
              // most likely, we received something other than a promise in the array
              resolve({
                status: 'rejected',
                reason: err
              });
            }
          });
        }));
      }

      return {
        allSettled: allSettled
      };
    }
  };
  module.exports = {
    name: 'AsyncTest',
    factory: function factory(dependencies) {
      'use strict';

      var TestEvent = dependencies.TestEvent,
          publish = dependencies.publish;

      function noop() {}
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

      function isPromise(input) {
        return input && typeof input.then === 'function';
      }
      /**
       * Runs `given` and passes any output forward
       * @param {Object} context
       */


      function runGiven(_x) {
        return _runGiven.apply(this, arguments);
      }
      /**
       * Runs `when` and passes any output forward
       * @param {Object} context
       */


      function _runGiven() {
        _runGiven = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee3(context) {
          var actual;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.prev = 0;
                  actual = context.given();

                  if (!isPromise(actual)) {
                    _context3.next = 8;
                    break;
                  }

                  _context3.next = 5;
                  return actual;

                case 5:
                  _context3.t0 = _context3.sent;
                  _context3.next = 9;
                  break;

                case 8:
                  _context3.t0 = actual;

                case 9:
                  context.resultOfGiven = _context3.t0;
                  return _context3.abrupt("return", context);

                case 13:
                  _context3.prev = 13;
                  _context3.t1 = _context3["catch"](0);
                  context.err = _context3.t1;
                  throw _context3.t1;

                case 17:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, null, [[0, 13]]);
        }));
        return _runGiven.apply(this, arguments);
      }

      function runWhen(_x2) {
        return _runWhen.apply(this, arguments);
      }
      /**
       * Executes the assertions
       * @param {Object} context
       */


      function _runWhen() {
        _runWhen = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee4(context) {
          var actual;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.prev = 0;
                  actual = context.when(context.resultOfGiven);

                  if (!isPromise(actual)) {
                    _context4.next = 8;
                    break;
                  }

                  _context4.next = 5;
                  return actual;

                case 5:
                  _context4.t0 = _context4.sent;
                  _context4.next = 9;
                  break;

                case 8:
                  _context4.t0 = actual;

                case 9:
                  context.resultOfWhen = _context4.t0;
                  return _context4.abrupt("return", context);

                case 13:
                  _context4.prev = 13;
                  _context4.t1 = _context4["catch"](0);
                  context.err = _context4.t1;
                  return _context4.abrupt("return", context);

                case 17:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4, null, [[0, 13]]);
        }));
        return _runWhen.apply(this, arguments);
      }

      function checkAssertions(_x3) {
        return _checkAssertions.apply(this, arguments);
      } // /checkAssertions


      function _checkAssertions() {
        _checkAssertions = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee5(context) {
          var promises;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  promises = context.test.assertions.map(function (assertion) {
                    return assertOne(context.batchId, assertion, function () {
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
                    });
                  });
                  return _context5.abrupt("return", Promise.all(promises).then(function (events) {
                    if (!Array.isArray(events)) {
                      return context;
                    }

                    events.forEach(function (event) {
                      context.outcomes.push(Object.assign({
                        behavior: 'anonymous'
                      }, event));
                    });
                    return context;
                  }));

                case 2:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5);
        }));
        return _checkAssertions.apply(this, arguments);
      }

      function maybeLog(_x4) {
        return _maybeLog.apply(this, arguments);
      }
      /**
       * Executes one assertion
       * @param {Object} context
       */


      function _maybeLog() {
        _maybeLog = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee6(maybePromise) {
          var result;
          return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  if (!isPromise(maybePromise)) {
                    _context6.next = 8;
                    break;
                  }

                  _context6.next = 3;
                  return maybePromise();

                case 3:
                  result = _context6.sent;

                  if (!(result && typeof result.log !== 'undefined')) {
                    _context6.next = 6;
                    break;
                  }

                  return _context6.abrupt("return", result.log);

                case 6:
                  _context6.next = 10;
                  break;

                case 8:
                  if (!(maybePromise && typeof maybePromise.log !== 'undefined')) {
                    _context6.next = 10;
                    break;
                  }

                  return _context6.abrupt("return", maybePromise.log);

                case 10:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6);
        }));
        return _maybeLog.apply(this, arguments);
      }

      function assertOne(_x5, _x6, _x7) {
        return _assertOne.apply(this, arguments);
      } // /assertOne

      /**
       * The context for one flow
       * @param {Object} context
       */


      function _assertOne() {
        _assertOne = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee7(batchId, assertion, test) {
          var maybePromise;
          return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  _context7.prev = 0;

                  if (!assertion.skipped) {
                    _context7.next = 3;
                    break;
                  }

                  return _context7.abrupt("return", publish({
                    type: TestEvent.types.TEST,
                    status: TestEvent.status.SKIPPED,
                    batchId: batchId,
                    behavior: assertion.behavior
                  }));

                case 3:
                  _context7.next = 5;
                  return test();

                case 5:
                  maybePromise = _context7.sent;
                  _context7.t0 = publish;
                  _context7.t1 = TestEvent.types.TEST;
                  _context7.t2 = TestEvent.status.PASSED;
                  _context7.t3 = batchId;
                  _context7.t4 = assertion.behavior;
                  _context7.next = 13;
                  return maybeLog(maybePromise);

                case 13:
                  _context7.t5 = _context7.sent;
                  _context7.t6 = {
                    type: _context7.t1,
                    status: _context7.t2,
                    batchId: _context7.t3,
                    behavior: _context7.t4,
                    log: _context7.t5
                  };
                  return _context7.abrupt("return", (0, _context7.t0)(_context7.t6));

                case 18:
                  _context7.prev = 18;
                  _context7.t7 = _context7["catch"](0);
                  return _context7.abrupt("return", publish({
                    type: TestEvent.types.TEST,
                    status: TestEvent.status.FAILED,
                    batchId: batchId,
                    behavior: assertion.behavior,
                    error: _context7.t7
                  }));

                case 21:
                case "end":
                  return _context7.stop();
              }
            }
          }, _callee7, null, [[0, 18]]);
        }));
        return _assertOne.apply(this, arguments);
      }

      function Context(context) {
        var self = {
          test: context.test,
          config: context.config,
          batchId: context.batchId,
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
      // {
      //   given: [Function: when],
      //   when: [Function: when],
      //   assertions: [{
      //     behavior: 'when dividing a number by zero, we get Infinity',
      //     test: [Function: we get Infinity]
      //   }]
      // }


      function AsyncTest(test, config, batchId) {
        return function () {
          // we need a Promise wrapper, to timout the test if it never returns
          return new Promise(function (resolve, reject) {
            // run the tests concurrently
            setTimeout(function () {
              // setup the intial context
              var context = new Context({
                test: test,
                config: config,
                batchId: batchId,
                timer: setTimeout(
                /*#__PURE__*/
                _asyncToGenerator(
                /*#__PURE__*/
                regeneratorRuntime.mark(function _callee() {
                  return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          _context.t0 = resolve;
                          _context.next = 3;
                          return publish({
                            // was reject
                            type: TestEvent.types.TEST,
                            status: TestEvent.status.BROKEN,
                            batchId: batchId,
                            behavior: test.behavior,
                            error: new Error("Timeout: the test exceeded ".concat(context.config.timeout, " ms"))
                          });

                        case 3:
                          _context.t1 = _context.sent;
                          return _context.abrupt("return", (0, _context.t0)(_context.t1));

                        case 5:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee);
                })), config.timeout),
                err: null // null is the default

              }); // run the flow

              return Promise.resolve(context).then(useNoopsIfSkipped).then(runGiven).then(runWhen).then(checkAssertions).then(function (context) {
                clearTimeout(context.timer);
                return resolve(context.outcomes);
              }).catch(
              /*#__PURE__*/
              function () {
                var _ref2 = _asyncToGenerator(
                /*#__PURE__*/
                regeneratorRuntime.mark(function _callee2(err) {
                  return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          clearTimeout(context.timer);
                          _context2.t0 = resolve;
                          _context2.next = 4;
                          return publish({
                            // was reject
                            type: TestEvent.types.TEST,
                            status: TestEvent.status.BROKEN,
                            batchId: batchId,
                            behavior: test.behavior,
                            error: err && err.error ? err.error : err
                          });

                        case 4:
                          _context2.t1 = _context2.sent;
                          return _context2.abrupt("return", (0, _context2.t0)(_context2.t1));

                        case 6:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _callee2);
                }));

                return function (_x8) {
                  return _ref2.apply(this, arguments);
                };
              }()); // /flow
            }, 0); // /setTimeout
          }); // /outer Promise
        }; // /wrapper
      } // /AsyncTest


      return {
        AsyncTest: AsyncTest
      };
    } // /factory
    // /module

  };
  module.exports = {
    name: 'makeBatch',
    factory: function factory() {
      'use strict';

      var givenSynonyms = ['given', 'arrange'];
      var whenSynonyms = ['when', 'act', 'topic'];
      var config = ['timeout', 'assertionLibrary', 'reporter'];
      var actions = givenSynonyms.concat(whenSynonyms, config);
      var tapSkipPattern = /^# SKIP /i;
      var tapSkipOrTodoPattern = /(^# SKIP )|(^# TODO )/i;

      function parseOne(behavior, node, given, when, skipped, timeout, assertionLib) {
        timeout = timeout || node.timeout;
        assertionLib = assertionLib || node.assertionLibrary;
        skipped = skipped || node.skipped;
        var passes = [];
        var parent = new Pass(behavior, node, given, when, skipped, timeout, assertionLib);

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
        if (typeof key === 'string' && key.trim().length) {
          return "".concat(trimBehavior(behavior), ", ").concat(trimBehavior(key));
        }

        return trimBehavior(behavior);
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

      function makeBatch(tests) {
        var parsed = [];
        Object.keys(tests).forEach(function (key) {
          parsed = parsed.concat(parseOne(key, tests[key]));
        });
        return parsed;
      }

      return {
        makeBatch: makeBatch
      };
    }
  };
  module.exports = {
    name: 'makeDebugger',
    factory: function factory() {
      'use strict';

      var makeDebugger = function makeDebugger(include) {
        var INCLUDE = include || typeof process !== 'undefined' && process.env && process.env.NODE_DEBUG;
        return {
          withSource: function withSource(source) {
            return function () {
              for (var _len = arguments.length, params = new Array(_len), _key = 0; _key < _len; _key++) {
                params[_key] = arguments[_key];
              }

              if (INCLUDE && (INCLUDE.split(',').indexOf('supposed') > -1 || INCLUDE.split(',').indexOf(source) > -1)) {
                console.dir(params, {
                  depth: null
                });
              } // return the 1st input to make this pass-through/chainable


              return params && params[0];
            };
          }
        };
      };

      return {
        makeDebugger: makeDebugger
      };
    }
  };
  module.exports = {
    name: 'makeSuiteConfig',
    factory: function factory(dependencies) {
      'use strict';

      var defaults = dependencies.defaults,
          subscribe = dependencies.subscribe,
          subscriptionExists = dependencies.subscriptionExists,
          allSubscriptions = dependencies.allSubscriptions,
          reporterFactory = dependencies.reporterFactory;

      var makeSuiteId = function makeSuiteId() {
        return "S".concat((Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase());
      };

      var makeSuiteConfig = function makeSuiteConfig(options) {
        var suiteConfig = {
          assertionLibrary: defaults.assertionLibrary,
          match: defaults.match,
          name: makeSuiteId(),
          timeout: 2000,
          reporters: []
        };
        options = _objectSpread({}, options);
        ['assertionLibrary', 'match', 'name', 'timeout'].forEach(function (item) {
          if (typeof options[item] !== 'undefined') {
            suiteConfig[item] = options[item];
          }
        });

        var makeReporterArray = function makeReporterArray(input) {
          return input.split(',').map(function (reporter) {
            return reporter.trim().toUpperCase();
          });
        };

        var addReporter = function addReporter(nameOrFunc) {
          if (typeof nameOrFunc === 'string') {
            var reporter = reporterFactory.get(nameOrFunc);

            if (!subscriptionExists(reporter.name)) {
              subscribe(reporter);
            }

            suiteConfig.reporters.push(reporter);
          } else {
            reporterFactory.add(nameOrFunc);
            addReporter(nameOrFunc.name);
          }
        }; // accept strings or functions in the reporter and reporters properties


        if (typeof options.reporter === 'string') {
          makeReporterArray(options.reporter).forEach(addReporter);
        } else if (typeof options.reporters === 'string') {
          makeReporterArray(options.reporters).forEach(addReporter);
        } else if (Array.isArray(options.reporters)) {
          options.reporters.forEach(addReporter);
        } else if (typeof options.reporter === 'function') {
          addReporter(function CustomReporter() {
            return {
              write: options.reporter
            };
          });
        } else if (options.reporter && typeof options.reporter.report === 'function') {
          addReporter(function CustomReporter() {
            return {
              write: options.reporter.report
            };
          });
        } else if (options.reporter && typeof options.reporter.write === 'function') {
          addReporter(function CustomReporter() {
            return {
              write: options.reporter.write
            };
          });
        }

        if (!suiteConfig.reporters.length) {
          defaults.reporters.forEach(addReporter);
        }

        suiteConfig.subscriptions = allSubscriptions();

        suiteConfig.makeTheoryConfig = function (theory) {
          theory = _objectSpread({}, theory);
          return {
            timeout: theory.timeout || suiteConfig.timeout,
            assertionLibrary: theory.assertionLibrary || suiteConfig.assertionLibrary
          };
        };

        return suiteConfig;
      }; // /makeSuiteConfig


      return {
        makeSuiteConfig: makeSuiteConfig
      };
    } // /factory
    // /module

  };
  module.exports = {
    name: 'pubsub',
    factory: function factory(dependencies) {
      'use strict';

      var allSettled = dependencies.allSettled,
          TestEvent = dependencies.TestEvent;

      var makeId = function makeId() {
        return "S".concat((Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase());
      };

      function Pubsub() {
        var subscriptions = [];

        var publish =
        /*#__PURE__*/
        function () {
          var _ref3 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee9(input) {
            var event;
            return regeneratorRuntime.wrap(function _callee9$(_context9) {
              while (1) {
                switch (_context9.prev = _context9.next) {
                  case 0:
                    event = new TestEvent(input);
                    _context9.next = 3;
                    return allSettled(subscriptions.map(
                    /*#__PURE__*/
                    function () {
                      var _ref4 = _asyncToGenerator(
                      /*#__PURE__*/
                      regeneratorRuntime.mark(function _callee8(subscription) {
                        return regeneratorRuntime.wrap(function _callee8$(_context8) {
                          while (1) {
                            switch (_context8.prev = _context8.next) {
                              case 0:
                                _context8.next = 2;
                                return subscription.write(event);

                              case 2:
                              case "end":
                                return _context8.stop();
                            }
                          }
                        }, _callee8);
                      }));

                      return function (_x10) {
                        return _ref4.apply(this, arguments);
                      };
                    }()));

                  case 3:
                    return _context9.abrupt("return", event);

                  case 4:
                  case "end":
                    return _context9.stop();
                }
              }
            }, _callee9);
          }));

          return function publish(_x9) {
            return _ref3.apply(this, arguments);
          };
        }();

        var subscribe = function subscribe(subscription) {
          var name = subscription.name || makeId();

          if (typeof subscription === 'function') {
            subscriptions.push({
              name: name,
              write: subscription
            });
          } else if (subscriptions && typeof subscription.write === 'function') {
            subscription.name = subscription.name || name;
            subscriptions.push(subscription);
          } else {
            throw new Error('Invalid subscription: expected either a function, or { name: string, write: function }');
          }
        };

        var subscriptionExists = function subscriptionExists(name) {
          if (subscriptions.find(function (subscription) {
            return subscription.name === name;
          })) {
            return true;
          }

          return false;
        };

        var allSubscriptions = function allSubscriptions() {
          return subscriptions.map(function (subscription) {
            return subscription.name;
          });
        };

        return {
          publish: publish,
          subscribe: subscribe,
          subscriptionExists: subscriptionExists,
          allSubscriptions: allSubscriptions
        };
      }

      return {
        Pubsub: Pubsub
      };
    }
  };
  module.exports = {
    name: 'Suite',
    factory: function factory(dependencies) {
      'use strict';

      var allSettled = dependencies.allSettled,
          AsyncTest = dependencies.AsyncTest,
          findFiles = dependencies.findFiles,
          makeBatch = dependencies.makeBatch,
          makeSuiteConfig = dependencies.makeSuiteConfig,
          publish = dependencies.publish,
          subscribe = dependencies.subscribe,
          reporterFactory = dependencies.reporterFactory,
          runServer = dependencies.runServer,
          runTests = dependencies.runTests,
          Tally = dependencies.Tally,
          TestEvent = dependencies.TestEvent;

      var makeBatchId = function makeBatchId() {
        return "B".concat((Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase());
      };

      var publishStartAndEnd = true;

      var makeNormalBatch = function makeNormalBatch(description, assertions) {
        var batch = {};
        batch[description] = assertions;
        return batch;
      };

      var normalizeBatch =
      /*#__PURE__*/
      function () {
        var _ref5 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee10(description, assertions) {
          var descriptionType, assertionsType;
          return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
              switch (_context10.prev = _context10.next) {
                case 0:
                  descriptionType = _typeof(description);
                  assertionsType = _typeof(assertions);

                  if (!(descriptionType === 'string' && assertionsType === 'function')) {
                    _context10.next = 6;
                    break;
                  }

                  return _context10.abrupt("return", Promise.resolve(makeNormalBatch(description, {
                    '': assertions
                  })));

                case 6:
                  if (!(descriptionType === 'string')) {
                    _context10.next = 10;
                    break;
                  }

                  return _context10.abrupt("return", Promise.resolve(makeNormalBatch(description, assertions)));

                case 10:
                  if (!(descriptionType === 'object')) {
                    _context10.next = 14;
                    break;
                  }

                  return _context10.abrupt("return", Promise.resolve(description));

                case 14:
                  if (!(descriptionType === 'function')) {
                    _context10.next = 18;
                    break;
                  }

                  return _context10.abrupt("return", Promise.resolve({
                    '': description
                  }));

                case 18:
                  return _context10.abrupt("return", Promise.reject(new Error('An invalid test was found: a test or batch of tests is required')));

                case 19:
                case "end":
                  return _context10.stop();
              }
            }
          }, _callee10);
        }));

        return function normalizeBatch(_x11, _x12) {
          return _ref5.apply(this, arguments);
        };
      }(); // /normalizebatch


      var matcher = function matcher(config) {
        return function (theory) {
          if (!config.match) {
            return true;
          }

          for (var i = 0; i < theory.assertions.length; i += 1) {
            if (config.match.test(theory.assertions[i].behavior)) {
              return true;
            }
          }
        };
      };

      var mapper = function mapper(config, byMatcher) {
        return function (batch) {
          var batchId = makeBatchId();
          var processed = makeBatch(batch).filter(byMatcher);
          return {
            batchId: batchId,
            batch: processed,
            tests: processed.map(function (theory) {
              return new AsyncTest(theory, config.makeTheoryConfig(theory), batchId);
            })
          };
        };
      };

      var reduceResults = function reduceResults(results) {
        return results.reduce(function (output, current) {
          return Array.isArray(current.value) ? output.concat(current.value) : output.concat([current.value]);
        }, []);
      };

      var tester = function tester(config, mapToTests) {
        return (
          /*#__PURE__*/
          function () {
            var _ref6 = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee11(behaviorOrBatch, sut) {
              var batch, context, plan, results, batchTotals;
              return regeneratorRuntime.wrap(function _callee11$(_context11) {
                while (1) {
                  switch (_context11.prev = _context11.next) {
                    case 0:
                      _context11.prev = 0;
                      _context11.next = 3;
                      return normalizeBatch(behaviorOrBatch, sut);

                    case 3:
                      batch = _context11.sent;
                      context = mapToTests(batch);
                      plan = {
                        count: context.batch.reduce(function (count, item) {
                          return count + item.assertions.length;
                        }, 0),
                        completed: 0
                      };

                      if (!publishStartAndEnd) {
                        _context11.next = 9;
                        break;
                      }

                      _context11.next = 9;
                      return publish({
                        type: TestEvent.types.START,
                        time: Date.now(),
                        suiteId: config.name
                      });

                    case 9:
                      _context11.next = 11;
                      return publish({
                        type: TestEvent.types.START_BATCH,
                        batchId: context.batchId,
                        time: Date.now(),
                        suiteId: config.name,
                        plan: plan
                      });

                    case 11:
                      _context11.next = 13;
                      return allSettled(context.tests.map(function (test) {
                        return test();
                      }));

                    case 13:
                      results = _context11.sent;
                      batchTotals = Tally.getTally().batches[context.batchId];
                      _context11.next = 17;
                      return publish({
                        type: TestEvent.types.END_BATCH,
                        batchId: context.batchId,
                        time: Date.now(),
                        suiteId: config.name,
                        plan: {
                          count: plan.count,
                          completed: batchTotals.total
                        },
                        totals: batchTotals
                      });

                    case 17:
                      if (!publishStartAndEnd) {
                        _context11.next = 23;
                        break;
                      }

                      _context11.next = 20;
                      return publish(new TestEvent({
                        type: TestEvent.types.END_TALLY,
                        suiteId: config.name
                      }));

                    case 20:
                      _context11.next = 22;
                      return publish(new TestEvent({
                        type: TestEvent.types.END,
                        time: Date.now(),
                        suiteId: config.name,
                        totals: batchTotals
                      }));

                    case 22:
                      return _context11.abrupt("return", {
                        batchId: context.batchId,
                        results: reduceResults(results),
                        totals: batchTotals
                      });

                    case 23:
                      return _context11.abrupt("return", {
                        batchId: context.batchId,
                        results: reduceResults(results),
                        totals: batchTotals
                      });

                    case 26:
                      _context11.prev = 26;
                      _context11.t0 = _context11["catch"](0);
                      publish({
                        type: TestEvent.types.TEST,
                        status: TestEvent.status.BROKEN,
                        behavior: 'Failed to load test',
                        suiteId: config.name,
                        error: _context11.t0
                      });
                      throw _context11.t0;

                    case 30:
                    case "end":
                      return _context11.stop();
                  }
                }
              }, _callee11, null, [[0, 26]]);
            }));

            return function (_x13, _x14) {
              return _ref6.apply(this, arguments);
            };
          }()
        );
      };

      var nodeRunner = function nodeRunner(config, test) {
        return function (options) {
          return (
            /*#__PURE__*/
            _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee12() {
              var output, brokenPromises, tally;
              return regeneratorRuntime.wrap(function _callee12$(_context12) {
                while (1) {
                  switch (_context12.prev = _context12.next) {
                    case 0:
                      publishStartAndEnd = false;
                      _context12.next = 3;
                      return publish({
                        type: TestEvent.types.START,
                        time: Date.now(),
                        suiteId: config.name
                      });

                    case 3:
                      _context12.next = 5;
                      return findFiles(options).then(runTests(test));

                    case 5:
                      output = _context12.sent;

                      if (!output.broken.length) {
                        _context12.next = 10;
                        break;
                      }

                      // these tests failed before being executed
                      brokenPromises = output.broken.map(function (error) {
                        return publish({
                          type: TestEvent.types.TEST,
                          status: TestEvent.status.BROKEN,
                          behavior: "Failed to load test: ".concat(error.filePath),
                          suiteId: config.name,
                          error: error
                        });
                      });
                      _context12.next = 10;
                      return allSettled(brokenPromises);

                    case 10:
                      _context12.next = 12;
                      return publish(new TestEvent({
                        type: TestEvent.types.END_TALLY,
                        suiteId: config.name
                      }));

                    case 12:
                      tally = Tally.getSimpleTally();
                      _context12.next = 15;
                      return publish(new TestEvent({
                        type: TestEvent.types.END,
                        time: Date.now(),
                        suiteId: config.name,
                        totals: tally
                      }));

                    case 15:
                      return _context12.abrupt("return", {
                        files: output.files,
                        results: output.results,
                        broken: output.broken,
                        config: output.config,
                        suite: test,
                        totals: tally
                      });

                    case 16:
                    case "end":
                      return _context12.stop();
                  }
                }
              }, _callee12);
            }))
          );
        };
      };

      var browserRunner = function browserRunner(config, test) {
        return function (options) {
          return (
            /*#__PURE__*/
            _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee13() {
              var output;
              return regeneratorRuntime.wrap(function _callee13$(_context13) {
                while (1) {
                  switch (_context13.prev = _context13.next) {
                    case 0:
                      _context13.next = 2;
                      return findFiles(options).then(runServer(test, options));

                    case 2:
                      output = _context13.sent;
                      return _context13.abrupt("return", output);

                    case 4:
                    case "end":
                      return _context13.stop();
                  }
                }
              }, _callee13);
            }))
          );
        };
      };
      /**
       * The test library
       * @param {Object} suiteConfig : optional configuration
      */


      function Suite(suiteConfig) {
        var config = makeSuiteConfig(suiteConfig);
        var byMatcher = matcher(config);
        var mapToTests = mapper(config, byMatcher);
        var test = tester(config, mapToTests);
        var findAndRun = nodeRunner(config, test);
        var findAndStart = browserRunner(config, test);
        /**
        // Make a newly configured suite
        */
        // test.Suite = Suite

        test.printSummary =
        /*#__PURE__*/
        _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee14() {
          return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
              switch (_context14.prev = _context14.next) {
                case 0:
                  _context14.next = 2;
                  return publish(new TestEvent({
                    type: TestEvent.types.END,
                    time: Date.now(),
                    suiteId: config.name,
                    totals: Tally.getSimpleTally()
                  }));

                case 2:
                case "end":
                  return _context14.stop();
              }
            }
          }, _callee14);
        }));

        test.getTotals = function () {
          return Tally.getSimpleTally();
        };

        test.suiteName = config.name;

        test.runner = function (options) {
          return {
            run: findAndRun(options),
            startServer: findAndStart(options)
          };
        };

        test.reporters = config.reporters;
        test.config = config;
        test.subscribe = subscribe;
        test.dependencies = suiteConfig && suiteConfig.inject;
        test.reporterFactory = reporterFactory; // Suite.suites.push(test)

        return test;
      } // Suite.suites = []


      return {
        Suite: Suite
      };
    } // /factory
    // /module

  };
  module.exports = {
    name: 'TestEvent',
    factory: function factory() {
      'use strict';

      var TYPE_EXPRESSION = /(^START$)|(^START_BATCH$)|(^TEST$)|(^INFO$)|(^END_BATCH$)|(^END_TALLY$)|(^END$)/;
      var STATUS_EXPRESSION = /(^PASSED$)|(^SKIPPED$)|(^FAILED$)|(^BROKEN$)/;

      var makeJSONStringifiableError = function makeJSONStringifiableError(err) {
        var error = {
          message: err.message,
          stack: err.stack
        };
        Object.keys(err).forEach(function (key) {
          var _err = err[key];

          if (_err && _err.message) {
            error[key] = makeJSONStringifiableError(err[key]);
          } else {
            error[key] = err[key];
          }
        });
        return error;
      };

      var TestEvent = function TestEvent(event) {
        var self = {};
        event = Object.assign({}, event);
        self.type = getType(event.type);

        if (typeof event.status === 'string' && STATUS_EXPRESSION.test(event.status)) {
          self.status = event.status;
        } else if (event.status) {
          self.status = 'UNKNOWN';
        }

        if (event.behavior) {
          self.behavior = event.behavior;
        }

        if (event.error) {
          self.error = makeJSONStringifiableError(event.error);
        }

        if (event.batchId) {
          self.batchId = event.batchId;
        }

        if (event.suiteId) {
          self.suiteId = event.suiteId;
        }

        if (event.plan) {
          self.plan = event.plan;
        }

        if (typeof event.log !== 'undefined') {
          self.log = event.log;
        }

        if (event.time) {
          self.time = event.time;
        }

        if (event.totals) {
          self.totals = event.totals;
        }

        return Object.freeze(self);
      };

      TestEvent.types = {
        START: 'START',
        START_BATCH: 'START_BATCH',
        TEST: 'TEST',
        INFO: 'INFO',
        END_BATCH: 'END_BATCH',
        END_TALLY: 'END_TALLY',
        END: 'END'
      };
      TestEvent.status = {
        PASSED: 'PASSED',
        SKIPPED: 'SKIPPED',
        FAILED: 'FAILED',
        BROKEN: 'BROKEN'
      };

      function getType(type) {
        if (TYPE_EXPRESSION.test(type)) {
          return type;
        }

        return 'UNKNOWN';
      }

      return {
        TestEvent: TestEvent
      };
    } // /factory
    // /module

  };
  module.exports = {
    name: 'consoleStyles',
    factory: function factory() {
      'use strict';

      var consoleStyles = [{
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
      }].reduce(function (styles, style) {
        styles[style.name] = function (input) {
          return input;
        };

        return styles;
      }, {});

      consoleStyles.newLine = function () {
        return '\n';
      };

      return {
        consoleStyles: consoleStyles
      };
    }
  };
  module.exports = {
    name: 'DefaultFormatter',
    factory: function factory(dependencies) {
      'use strict';

      var consoleStyles = dependencies.consoleStyles,
          TestEvent = dependencies.TestEvent,
          SYMBOLS = dependencies.SYMBOLS;
      var newLine = consoleStyles.newLine();

      var formatInfo = function formatInfo(log) {
        if (typeof log === 'undefined') {
          return '';
        }

        return newLine + JSON.stringify(log, null, 2).split(newLine).map(function (line) {
          return "    ".concat(line);
        }).join(newLine);
      };

      var formatComparable = function formatComparable(input) {
        var output = JSON.stringify(input, null, 2);

        if (input && !output) {
          output = input.toString();
        }

        if (output.indexOf(newLine) > -1) {
          return output.split(newLine).map(function (line) {
            return "    ".concat(line);
          }).join(newLine).substring(4) + newLine;
        }

        return output;
      };

      var formatExpectedAndActual = function formatExpectedAndActual(error) {
        return "    expected: ".concat(consoleStyles.green(formatComparable(error.expected))) + "    actual: ".concat(consoleStyles.red(formatComparable(error.actual)));
      };

      var formatStack = function formatStack(error) {
        if (!error.stack) {
          return '';
        }

        var stack = error.stack.split(newLine).map(function (line) {
          return "    ".concat(line.trim());
        }).join(newLine);
        return error.expected && error.actual ? "".concat(newLine).concat(newLine).concat(stack).concat(newLine) : "".concat(newLine).concat(stack).concat(newLine);
      };

      function DefaultFormatter() {
        var format = function format(event) {
          if (event.type === TestEvent.types.START) {
            return "".concat(newLine).concat(SYMBOLS.INFO, "Running tests...");
          }

          if (event.type === TestEvent.types.END) {
            var totals = event.totals;
            return "".concat(newLine).concat(SYMBOLS.INFO, "total: ").concat(consoleStyles.cyan(totals.total)) + "  passed: ".concat(consoleStyles.green(totals.passed)) + "  failed: ".concat(consoleStyles.red(totals.failed + totals.broken)) + "  skipped: ".concat(consoleStyles.yellow(totals.skipped)) + "  duration: ".concat((totals.endTime - totals.startTime) / 1000).concat(newLine);
          } else if (event.type === TestEvent.types.INFO) {
            return "".concat(SYMBOLS[event.type]).concat(event.behavior).concat(formatInfo(event.log));
          } else if (event.type === TestEvent.types.TEST) {
            if (!event.error) {
              return "".concat(SYMBOLS[event.status]).concat(event.behavior).concat(formatInfo(event.log));
            } else if (event.error.expected && event.error.actual) {
              return "".concat(SYMBOLS[event.status]).concat(event.behavior).concat(newLine).concat(newLine) + formatExpectedAndActual(event.error) + formatStack(event.error);
            } else {
              return "".concat(SYMBOLS[event.status]).concat(event.behavior) + formatStack(event.error);
            }
          }
        }; // /format


        return {
          format: format
        };
      } // /Formatter


      return {
        DefaultFormatter: DefaultFormatter
      };
    }
  };
  module.exports = {
    name: 'TapFormatter',
    factory: function factory(dependencies) {
      'use strict';

      var consoleStyles = dependencies.consoleStyles,
          TestEvent = dependencies.TestEvent;
      var newLine = consoleStyles.newLine();
      var whitespace = '        ';

      var reIndent = function reIndent(input, spaces, trim) {
        var indent = whitespace.substring(0, spaces);
        return input.split(newLine).map(function (line) {
          return "".concat(indent).concat(trim ? line.trim() : line);
        }).join(newLine).substring(spaces);
      };

      var formatMessage = function formatMessage(input) {
        var message = input.split(newLine).map(function (line) {
          return line.replace(/\s\s+/g, ' ').replace(/"/g, '\\"');
        }).join(' ');
        return "\"".concat(message, "\"");
      };

      var formatInfo = function formatInfo(behavior, log, severity) {
        if (typeof log === 'undefined') {
          return '';
        }

        var message = typeof log.message === 'string' ? log.message : "comment for: ".concat(behavior);
        return newLine + "  ---".concat(newLine) + "  message: \"".concat(message, "\"").concat(newLine) + "  severity: ".concat(severity).concat(newLine) + "  data:".concat(newLine) + "    ".concat(reIndent(JSON.stringify(log, null, 2), 4)).concat(newLine) + '  ...';
      };

      var formatError = function formatError(error, severity) {
        if (!error) {
          return '';
        }

        var actualAndExpectedExist = error.expected && error.actual;
        var stackExists = typeof error.stack === 'string';
        var output = "".concat(newLine, "  ---").concat(newLine) + "  message: ".concat(formatMessage(error.message)).concat(newLine) + "  severity: ".concat(severity).concat(newLine);

        if (actualAndExpectedExist && stackExists) {
          output += "  data:".concat(newLine);
          output += "    got: ".concat(error.actual).concat(newLine);
          output += "    expect: ".concat(error.expected).concat(newLine);
          output += "    stack: ".concat(reIndent(error.stack, 6, true)).concat(newLine);
        } else if (actualAndExpectedExist) {
          output += "  data:".concat(newLine);
          output += "    got: ".concat(error.actual).concat(newLine);
          output += "    expect: ".concat(error.expected).concat(newLine);
        } else if (stackExists) {
          output += "  data:".concat(newLine);
          output += "    stack: ".concat(reIndent(error.stack, 6, true)).concat(newLine);
        }

        output += '  ...';
        return output;
      };

      function TapFormatter() {
        var testCount = 0;

        var format = function format(event) {
          if (event.type === TestEvent.types.START) {
            return 'TAP version 13';
          }

          if (event.type === TestEvent.types.END) {
            return "1..".concat(event.totals.total);
          } else if (event.type === TestEvent.types.INFO) {
            return "# ".concat(event.behavior).concat(formatInfo(event.behavior, event.log, 'comment'));
          } else if (event.type === TestEvent.types.TEST) {
            testCount += 1;

            switch (event.status) {
              case TestEvent.status.PASSED:
                return "ok ".concat(testCount, " - ").concat(event.behavior).concat(formatInfo(event.behavior, event.log, 'comment'));

              case TestEvent.status.SKIPPED:
                return event.behavior.indexOf('# TODO') > -1 ? "ok ".concat(testCount, " # TODO ").concat(event.behavior.replace('# TODO ', '')) : "ok ".concat(testCount, " # SKIP ").concat(event.behavior);

              case TestEvent.status.FAILED:
                return "not ok ".concat(testCount, " - ").concat(event.behavior).concat(formatError(event.error, 'fail'));

              case TestEvent.status.BROKEN:
                return "not ok ".concat(testCount, " - ").concat(event.behavior).concat(formatError(event.error, 'broken'));
            }
          }
        }; // /format


        return {
          format: format
        };
      } // /Formatter


      return {
        TapFormatter: TapFormatter
      };
    }
  };
  module.exports = {
    name: 'ArrayReporter',
    factory: function factory() {
      'use strict';

      function ArrayReporter() {
        var events = [];

        var write =
        /*#__PURE__*/
        function () {
          var _ref10 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee15(event) {
            return regeneratorRuntime.wrap(function _callee15$(_context15) {
              while (1) {
                switch (_context15.prev = _context15.next) {
                  case 0:
                    return _context15.abrupt("return", events.push(event));

                  case 1:
                  case "end":
                    return _context15.stop();
                }
              }
            }, _callee15);
          }));

          return function write(_x15) {
            return _ref10.apply(this, arguments);
          };
        }();

        return {
          write: write,
          events: events
        };
      }

      return {
        ArrayReporter: ArrayReporter
      };
    }
  };
  module.exports = {
    name: 'BlockReporter',
    factory: function factory(dependencies) {
      'use strict';

      var consoleStyles = dependencies.consoleStyles,
          ConsoleReporter = dependencies.ConsoleReporter,
          DefaultFormatter = dependencies.DefaultFormatter;

      function BlockReporter() {
        var write = ConsoleReporter({
          formatter: DefaultFormatter({
            SYMBOLS: {
              PASSED: "".concat(consoleStyles.bgGreen(consoleStyles.black(' PASS ')), " "),
              FAILED: "".concat(consoleStyles.bgRed(consoleStyles.black(' FAIL ')), " "),
              BROKEN: "".concat(consoleStyles.bgMagenta(consoleStyles.black(' !!!! ')), " "),
              SKIPPED: "".concat(consoleStyles.bgYellow(consoleStyles.black(' SKIP ')), " "),
              INFO: "".concat(consoleStyles.bgCyan(consoleStyles.black(' INFO ')), " ")
            }
          })
        }).write;
        return {
          write: write
        };
      }

      return {
        BlockReporter: BlockReporter
      };
    }
  };
  module.exports = {
    name: 'BriefReporter',
    factory: function factory(dependencies) {
      'use strict';

      var consoleStyles = dependencies.consoleStyles,
          ConsoleReporter = dependencies.ConsoleReporter,
          DefaultFormatter = dependencies.DefaultFormatter,
          TestEvent = dependencies.TestEvent;

      function BriefReporter() {
        var _write = ConsoleReporter({
          formatter: DefaultFormatter({
            SYMBOLS: {
              PASSED: consoleStyles.green('✓ '),
              // heavy-check: '✔',
              FAILED: consoleStyles.red('✗ '),
              // heavy-x '✘',
              BROKEN: consoleStyles.red('!= '),
              // heavy-x '✘',
              SKIPPED: consoleStyles.yellow('⸕ '),
              INFO: consoleStyles.cyan('→ ')
            }
          })
        }).write;

        var write = function write(event) {
          if ([TestEvent.types.START, TestEvent.types.END].indexOf(event.type) > -1) {
            _write(event);
          } else if (event.type === TestEvent.types.TEST && (event.status === TestEvent.status.FAILED || event.status === TestEvent.status.BROKEN)) {
            _write(event);
          }
        };

        return {
          write: write
        };
      }

      return {
        BriefReporter: BriefReporter
      };
    }
  };
  module.exports = {
    name: 'ConsoleReporter',
    factory: function factory(dependencies) {
      'use strict';

      var TestEvent = dependencies.TestEvent,
          formatter = dependencies.formatter;
      var format = formatter.format;

      function ConsoleReporter() {
        var write =
        /*#__PURE__*/
        function () {
          var _ref11 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee16(event) {
            return regeneratorRuntime.wrap(function _callee16$(_context16) {
              while (1) {
                switch (_context16.prev = _context16.next) {
                  case 0:
                    if ([TestEvent.types.START, TestEvent.types.TEST, TestEvent.types.INFO, TestEvent.types.END].indexOf(event.type) > -1) {
                      console.log(format(event));
                    }

                  case 1:
                  case "end":
                    return _context16.stop();
                }
              }
            }, _callee16);
          }));

          return function write(_x16) {
            return _ref11.apply(this, arguments);
          };
        }(); // /write


        return {
          write: write
        };
      }

      return {
        ConsoleReporter: ConsoleReporter
      };
    }
  };
  module.exports = {
    name: 'DefaultReporter',
    factory: function factory(dependencies) {
      'use strict';

      var consoleStyles = dependencies.consoleStyles,
          ConsoleReporter = dependencies.ConsoleReporter,
          DefaultFormatter = dependencies.DefaultFormatter;

      function DefaultReporter() {
        var write = ConsoleReporter({
          formatter: DefaultFormatter({
            SYMBOLS: {
              PASSED: consoleStyles.green('✓ '),
              // heavy-check: '✔',
              FAILED: consoleStyles.red('✗ '),
              // heavy-x '✘',
              BROKEN: consoleStyles.red('!= '),
              // heavy-x '✘',
              SKIPPED: consoleStyles.yellow('⸕ '),
              INFO: consoleStyles.cyan('→ ')
            }
          })
        }).write;
        return {
          write: write
        };
      }

      return {
        DefaultReporter: DefaultReporter
      };
    }
  };
  module.exports = {
    name: 'JsonReporter',
    factory: function factory(dependencies) {
      'use strict';

      var TestEvent = dependencies.TestEvent;

      function JsonReporter() {
        var write =
        /*#__PURE__*/
        function () {
          var _ref12 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee17(event) {
            return regeneratorRuntime.wrap(function _callee17$(_context17) {
              while (1) {
                switch (_context17.prev = _context17.next) {
                  case 0:
                    if (event.type === TestEvent.types.START) {
                      console.log("[".concat(JSON.stringify({
                        event: event
                      }, null, 2), ","));
                    } else if (event.type === TestEvent.types.END) {
                      console.log("".concat(JSON.stringify({
                        event: event
                      }, null, 2), "]"));
                    } else if ([TestEvent.types.END_TALLY].indexOf(event.type) === -1) {
                      console.log("".concat(JSON.stringify({
                        event: event
                      }, null, 2), ","));
                    }

                  case 1:
                  case "end":
                    return _context17.stop();
                }
              }
            }, _callee17);
          }));

          return function write(_x17) {
            return _ref12.apply(this, arguments);
          };
        }(); // /write


        return {
          write: write
        };
      }

      return {
        JsonReporter: JsonReporter
      };
    }
  };
  module.exports = {
    name: 'NoopReporter',
    factory: function factory() {
      'use strict';

      function NoopReporter() {
        return {
          write: function () {
            var _write2 = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee18() {
              return regeneratorRuntime.wrap(function _callee18$(_context18) {
                while (1) {
                  switch (_context18.prev = _context18.next) {
                    case 0:
                    case "end":
                      return _context18.stop();
                  }
                }
              }, _callee18);
            }));

            function write() {
              return _write2.apply(this, arguments);
            }

            return write;
          }()
        };
      }

      return {
        NoopReporter: NoopReporter
      };
    }
  };
  module.exports = {
    name: 'reporterFactory',
    factory: function factory(dependencies) {
      'use strict';

      var makeDebugger = dependencies.makeDebugger;
      var debug = makeDebugger().withSource('reporter-factory');

      function ReporterFactory() {
        var self = {};
        var map = {};

        var uppered = function uppered(name) {
          return typeof name === 'string' ? name.trim().toUpperCase() : undefined;
        };

        self.get = function (name) {
          var _name = uppered(name);

          if (!map[_name]) {
            throw new Error("A reporter by name, \"".concat(name, "\", is not registered"));
          }

          debug("Getting: ".concat(_name), map[_name]);
          var reporter = new map[_name]();
          reporter.name = reporter.name || _name;
          return reporter;
        };

        self.add = function (reporter) {
          if (typeof reporter !== 'function') {
            throw new Error("Invalid Reporter: expected reporter {".concat(_typeof(reporter), "} to be a {function}"));
          }

          var errors = [];

          if (typeof reporter.name !== 'string' || reporter.name.trim().length < 1) {
            errors.push("Invalid Reporter: expected reporter.name {".concat(_typeof(reporter.name), "} to be a non-empty {string}"));
          }

          var _reporter = reporter(),
              write = _reporter.write;

          if (typeof write !== 'function') {
            errors.push("Invalid Reporter: expected reporter().write {".concat(_typeof(write), "} to be a {function}"));
          }

          if (errors.length) {
            throw new Error(errors.join(', '));
          }

          var name = uppered(reporter.name);
          map[name] = reporter;
          debug("Adding: ".concat(name), reporter);

          if (name.indexOf('REPORTER')) {
            var shortName = name.substring(0, name.indexOf('REPORTER'));
            map[shortName] = reporter;
            debug("Adding: ".concat(shortName), reporter);
          }

          return self;
        };

        return self;
      }

      return {
        ReporterFactory: ReporterFactory
      };
    }
  };
  module.exports = {
    name: 'tally',
    factory: function factory(dependencies) {
      'use strict';

      var publish = dependencies.publish,
          TestEvent = dependencies.TestEvent;

      function TallyFactory() {
        var now = function now() {
          return Date.now();
        };

        var makeTally = function makeTally() {
          return {
            total: 0,
            passed: 0,
            skipped: 0,
            failed: 0,
            broken: 0,
            startTime: -1,
            endTime: -1
          };
        }; // there's only 1 tally per require


        var totals = {
          total: 0,
          passed: 0,
          skipped: 0,
          failed: 0,
          broken: 0,
          startTime: -1,
          endTime: -1,
          results: [],
          batches: {}
        };

        var makeBatchTally =
        /*#__PURE__*/
        function () {
          var _ref13 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee19(event) {
            var tally;
            return regeneratorRuntime.wrap(function _callee19$(_context19) {
              while (1) {
                switch (_context19.prev = _context19.next) {
                  case 0:
                    if (!totals.batches[event.batchId]) {
                      _context19.next = 4;
                      break;
                    }

                    _context19.next = 3;
                    return publish({
                      type: TestEvent.types.BROKEN,
                      batchId: event.batchId,
                      error: new Error('Duplicate Batch Ids were created, or multiple START_BATCH events were emitted for the same batch')
                    });

                  case 3:
                    return _context19.abrupt("return");

                  case 4:
                    tally = makeTally();
                    tally.startTime = now();
                    return _context19.abrupt("return", tally);

                  case 7:
                  case "end":
                    return _context19.stop();
                }
              }
            }, _callee19);
          }));

          return function makeBatchTally(_x18) {
            return _ref13.apply(this, arguments);
          };
        }();

        var bump = function bump(event) {
          var name = event.status.toLowerCase();
          totals[name] += 1;
          totals.total += 1;
          totals.batches[event.batchId][name] += 1;
          totals.batches[event.batchId].total += 1;
          totals.results.push(event);
        };

        function Tally() {
          var write =
          /*#__PURE__*/
          function () {
            var _ref14 = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee20(event) {
              return regeneratorRuntime.wrap(function _callee20$(_context20) {
                while (1) {
                  switch (_context20.prev = _context20.next) {
                    case 0:
                      _context20.t0 = event.type;
                      _context20.next = _context20.t0 === TestEvent.types.START ? 3 : _context20.t0 === TestEvent.types.START_BATCH ? 5 : _context20.t0 === TestEvent.types.TEST ? 9 : _context20.t0 === TestEvent.types.END_BATCH ? 11 : _context20.t0 === TestEvent.types.END_TALLY ? 13 : 15;
                      break;

                    case 3:
                      totals.startTime = now();
                      return _context20.abrupt("break", 15);

                    case 5:
                      _context20.next = 7;
                      return makeBatchTally(event);

                    case 7:
                      totals.batches[event.batchId] = _context20.sent;
                      return _context20.abrupt("break", 15);

                    case 9:
                      bump(event);
                      return _context20.abrupt("break", 15);

                    case 11:
                      totals.batches[event.batchId].endTime = now();
                      return _context20.abrupt("break", 15);

                    case 13:
                      totals.endTime = now();
                      return _context20.abrupt("break", 15);

                    case 15:
                    case "end":
                      return _context20.stop();
                  }
                }
              }, _callee20);
            }));

            return function write(_x19) {
              return _ref14.apply(this, arguments);
            };
          }(); // /write


          return {
            name: 'Tally',
            write: write
          };
        } // /Tally


        Tally.getTally = function () {
          return _objectSpread({}, totals);
        };

        Tally.getSimpleTally = function () {
          var tally = Tally.getTally();
          return {
            total: tally.total,
            passed: tally.passed,
            skipped: tally.skipped,
            failed: tally.failed,
            broken: tally.broken,
            startTime: tally.startTime,
            endTime: tally.endTime
          };
        };

        return {
          Tally: Tally
        };
      } // /TallyFactory


      return {
        TallyFactory: TallyFactory
      };
    } // resolve the dependency graph

  };
  var supposed = null; // resolve the dependency graph

  function Supposed(options) {
    var _module$factories$mak = module.factories.makeDebuggerFactory(),
        makeDebugger = _module$factories$mak.makeDebugger;

    var _module$factories$all = module.factories.allSettledFactory({
      makeDebugger: makeDebugger
    }),
        allSettled = _module$factories$all.allSettled;

    var _module$factories$Tes = module.factories.TestEventFactory({
      makeDebugger: makeDebugger
    }),
        TestEvent = _module$factories$Tes.TestEvent;

    var _module$factories$pub = module.factories.pubsubFactory({
      allSettled: allSettled,
      makeDebugger: makeDebugger,
      TestEvent: TestEvent
    }),
        Pubsub = _module$factories$pub.Pubsub;

    var _ref15 = new Pubsub(),
        publish = _ref15.publish,
        subscribe = _ref15.subscribe,
        subscriptionExists = _ref15.subscriptionExists,
        allSubscriptions = _ref15.allSubscriptions;

    var envvars = {
      assertionLibrary: {},
      reporters: ['DEFAULT'],
      useColors: true
    };
    var consoleStyles = module.factories.consoleStylesFactory({
      envvars: envvars,
      makeDebugger: makeDebugger
    }).consoleStyles;

    var _module$factories$Tal = module.factories.TallyFactory({
      publish: publish,
      TestEvent: TestEvent,
      makeDebugger: makeDebugger
    }),
        TallyFactory = _module$factories$Tal.TallyFactory;

    var _TallyFactory = TallyFactory(),
        Tally = _TallyFactory.Tally;

    var _module$factories$rep = module.factories.reporterFactory({
      makeDebugger: makeDebugger
    }),
        ReporterFactory = _module$factories$rep.ReporterFactory;

    var reporterFactory = new ReporterFactory();
    var ArrayReporter = module.factories.ArrayReporterFactory({
      makeDebugger: makeDebugger
    }).ArrayReporter;
    reporterFactory.add(ArrayReporter);
    reporterFactory.add(function QuietReporter() {
      // legacy
      return {
        write: new ArrayReporter().write
      };
    });
    reporterFactory.add(module.factories.JsonReporterFactory({
      makeDebugger: makeDebugger,
      TestEvent: TestEvent
    }).JsonReporter);
    reporterFactory.add(module.factories.NoopReporterFactory({
      makeDebugger: makeDebugger
    }).NoopReporter);
    reporterFactory.add(Tally);
    subscribe(reporterFactory.get(Tally.name));

    function DefaultFormatter(options) {
      return module.factories.DefaultFormatterFactory({
        consoleStyles: consoleStyles,
        makeDebugger: makeDebugger,
        TestEvent: TestEvent,
        SYMBOLS: options.SYMBOLS
      }).DefaultFormatter();
    }

    function ConsoleReporter(options) {
      return module.factories.ConsoleReporterFactory({
        makeDebugger: makeDebugger,
        TestEvent: TestEvent,
        formatter: options.formatter
      }).ConsoleReporter();
    }

    reporterFactory.add(module.factories.DefaultReporterFactory({
      consoleStyles: consoleStyles,
      ConsoleReporter: ConsoleReporter,
      DefaultFormatter: DefaultFormatter
    }).DefaultReporter).add(module.factories.BlockReporterFactory({
      consoleStyles: consoleStyles,
      ConsoleReporter: ConsoleReporter,
      DefaultFormatter: DefaultFormatter
    }).BlockReporter).add(module.factories.BriefReporterFactory({
      consoleStyles: consoleStyles,
      ConsoleReporter: ConsoleReporter,
      DefaultFormatter: DefaultFormatter,
      TestEvent: TestEvent
    }).BriefReporter).add(function TapReporter() {
      var write = ConsoleReporter({
        formatter: module.factories.TapFormatterFactory({
          consoleStyles: consoleStyles,
          makeDebugger: makeDebugger,
          TestEvent: TestEvent
        }).TapFormatter()
      }).write;
      return {
        write: write
      };
    });

    var _module$factories$Asy = module.factories.AsyncTestFactory({
      TestEvent: TestEvent,
      publish: publish,
      makeDebugger: makeDebugger
    }),
        AsyncTest = _module$factories$Asy.AsyncTest;

    var _module$factories$mak2 = module.factories.makeBatchFactory({
      makeDebugger: makeDebugger
    }),
        makeBatch = _module$factories$mak2.makeBatch;

    var _module$factories$mak3 = module.factories.makeSuiteConfigFactory({
      defaults: envvars,
      subscriptionExists: subscriptionExists,
      subscribe: subscribe,
      allSubscriptions: allSubscriptions,
      reporterFactory: reporterFactory,
      makeDebugger: makeDebugger
    }),
        makeSuiteConfig = _module$factories$mak3.makeSuiteConfig;

    var _module$factories$Sui = module.factories.SuiteFactory({
      allSettled: allSettled,
      AsyncTest: AsyncTest,
      makeBatch: makeBatch,
      makeDebugger: makeDebugger,
      makeSuiteConfig: makeSuiteConfig,
      publish: publish,
      subscribe: subscribe,
      reporterFactory: reporterFactory,
      Tally: Tally,
      TestEvent: TestEvent
    }),
        Suite = _module$factories$Sui.Suite;

    var suite = new Suite(options);
    suite.Suite = Supposed; // suite.runner is for the terminal only

    delete suite.runner;

    if (supposed && supposed.suites) {
      supposed.suites.push(suite);
    }

    return suite;
  }

  supposed = Supposed();
  supposed.suites = [supposed];
  window.supposed = supposed; // we don't need these anymore

  delete module.factories;
})(window);