'use strict';

module.exports = {
    'when dividing a number by zero': {
        when: resolve => { resolve(42 / 0); },
        'we get Infinity': (t, err, actual) => {
            t.equal(actual, Infinity);
        }
    },
    'when dividing zero by zero': {
        when: resolve => { resolve(0 / 0); },
        'we get a value which': {
            'is not a number': (t, err, actual) => {
                t.isNaN (actual);
            },
            'is not equal to itself': (t, err, actual) => {
                t.notEqual (actual, actual);
            }
        }
    },
    'when dividing': {
        'and we divide by zero': {
            when: resolve => { resolve(42 / 0); },
            'we get Infinity': (t, err, actual) => {
                t.equal(actual, Infinity);
            }
        },
        'and we divide zero by zero': {
            when: resolve => { resolve(0 / 0); },
            'we get a value which': {
                'is not a number': (t, err, actual) => {
                    t.isNaN (actual);
                },
                'is not equal to itself': (t, err, actual) => {
                    t.notEqual (actual, actual);
                }
            }
        }
    },
    'when dividing any number by zero': {
        when: resolve => { resolve(42 / 0); },
        'we get Infinity': (t, err, actual) => {
            t.equal(actual, Infinity);
        },
        'except when we divide zero by zero': {
            when: resolve => { resolve(0 / 0); },
            'we get a value which': {
                'is not a number': (t, err, actual) => {
                    t.isNaN (actual);
                },
                'is not equal to itself': (t, err, actual) => {
                    t.notEqual (actual, actual);
                }
            }
        }
    },
    'when we keep nesting (1)': {
        'and nesting (2)': {
            when: resolve => { resolve(42 / 0); },
            'it should support branching the rabbit hole': (t, err, actual) => {
                t.equal(actual, Infinity);
            },
            'and nesting (3)': {
                'and nesting (4)': {
                    when: resolve => { resolve(42 / 0); },
                    'it should follow the rabbit hole': (t, err, actual) => {
                        t.equal(actual, Infinity);
                    }
                }
            }
        }
    },
    'when there is no when function': {
        'it should still execute the assertions': t => {
            t.equal(true, true);
        }
    },
    'when a behavior is processed': {
        'and it has a when': {
            when: resolve => { resolve(42); },
            'it should still execute the assertions': (t, err, actual) => {
                t.equal(actual, 42);
            }
        },
        'and it does NOT have a when': {
            'it should still execute the assertions': t => {
                t.equal(true, true);
            }
        }
    },
    'when the `when` throws an error': {
        when: () => { throw new Error('BOOM!'); },
        'it should pass the error to the assertions': (t, err) => {
            t.equal(typeof err, 'object');
            t.equal(err.message, 'BOOM!');
        }
    },
    'when the `when` rejects': {
        when: (resolve, reject) => {
            reject(new Error('Boom!'));
        },
        'it should pass the rejection to the `err` argument': (t, err) => {
            t.equal(typeof err, 'object');
            t.equal(err.message, 'Boom!');
        }
    },
    'when the assertion throws an error': {
        'the test should fail': () => {
            throw new Error('assertion ERROR!');
        }
    },
    'when `when` is never resolved': {
        when: () => {},
        'it should throw a timeout exception': t => {
            t.fail('it should not get here');
        }
    },
    'when the assertion is skipped': {
        '// it should not run the assertion': t => {
            t.fail('it should not get here');
        }
    },
    '// when the when is skipped': {
        'it should not run the assertion': t => {
            t.fail('it should not get here');
        }
    },
    'when a test fails because of an equality error': {
        'it should print the difference': t => {
            t.equal(41, 42);
        }
    }
};
