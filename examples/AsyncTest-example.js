'use strict';

const AsyncTest = require('../AsyncTest.js');
const TestBatch = require('../TestBatch.js');
const assert = require('assert');

var happyTest = new TestBatch({
        'when dividing zero by zero': {
            when: resolve => { resolve(0 / 0); },
            'we get a value which': {
                'is not a number': (t, err, outcome) => {
                    t.equal(isNaN(outcome), true);
                },
                'is not equal to itself': (t, err, outcome) => {
                    t.notEqual(outcome, outcome);
                }
            }
        }
    }),
    sadTest = new TestBatch({
        'when dividing zero by zero': {
            when: resolve => { resolve(0 / 0); },
            'we get a value which': {
                'is not a number': (t, err, outcome) => {
                    t.equal(isNaN, true);
                },
                'is not equal to itself': (t, err, outcome) => {
                    t.notEqual(outcome, outcome);
                }
            }
        }
    }),
    timeoutTest = new TestBatch({
        'when dividing a number by zero': {
            when: resolve => { resolve(42 / 0); },
            'we get Infinity': (t, err, outcome) => {
                t.equal(outcome, Infinity);
            }
        }
    });

AsyncTest(
    happyTest[0],
    { timeout: 2000, assertionLibrary: assert }
).then(outcome => {
    console.dir(outcome, { depth: null });
}).catch(err => {
    console.dir(err, { depth: null });
});

AsyncTest(
    sadTest[0],
    { timeout: 2000, assertionLibrary: assert }
).then(outcome => {
    console.log();
    console.log('FAILED:', outcome.failed[0].behavior);
    console.log('actual:', outcome.failed[0].error.actual, 'expected:', outcome.failed[0].error.expected);
}).catch(err => {
    console.dir(err, { depth: null });
});
