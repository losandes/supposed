'use strict';

const tests = require('./sample-tests.js');
const TestBatch = require('../TestBatch.js');

console.dir(new TestBatch(tests), { depth: null });
