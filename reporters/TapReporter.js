'use strict';

const Printer = require('./Printer.js');
const styles = require('./console-styles.js');
const SYMBOLS = {
    passed: styles.green('✓ '), // heavy-check: '✔',
    failed: styles.red('✗ '), // heavy-x '✘',
    skipped: styles.yellow('⸕ '),
    info: styles.cyan('→ ')
};
const utilPrinter = require('util').print;
// TODO: this is deprecated ^^

module.exports = TapReporter;

function TapReporter (options) {
    var self = {},
        tap = new TapInterface(),
        printer;

    options = Object.assign({}, options);
    options.tail = '\n';
    printer = new Printer(options);

    //
    // TAP Reporter
    //

    self.name = 'tap';
    self.setStream = setStream;
    self.report = report;
    self.print = print;

    function setStream (s) {
        options.stream = s;
        printer = new Printer(options);
    }

    // example output:
    // 1..4
    // ok 1 - Input file opened
    // not ok 2 - First line of the input valid
    // ok 3 - Read the rest of the file
    // not ok 4 - Summarized correctly # TODO Not written yet
    function report (result) {
        switch (result.type) {
            // TODO: the start should
            case 'start':
                printer.print(tap.start() + styles.newLine());
                printer.print(tap.testCount());
                break;
            case 'startTest':
                break;
            case 'passed':
                printer.print(tap.ok(result.behavior));
                break;
            case 'skipped':
                printer.print(tap.skip(result.behavior));
                break;
            case 'failed':
                printer.print(tap.notOk(result.behavior));
                printer.print('# ' + result.error.message);
                // printer.print('# ' + result.error.stack);
                break;
            case 'error':
                printer.print(tap.notOk(result.behavior));
                printer.print(tap.bailOut(result.error));
                break;
            case 'end':
                printer.print(styles.newLine());
                // printer.print(styles.newLine() + tap.testCount());
                //     case "error":
                //       puts("#> Errored");
                //       puts("# " + JSON.stringify(data));
                //       break;

        }
    }

    function print (input) {
        utilPrinter(input);
    }

    return self;
}

function TapInterface () {
    var self = this;

    self.genOutput_ = function (status, testNumber, description) {
        return '' + status + ' ' + testNumber + ' ' + description;
    };

    self.start = function () {
        self.count_ = 0;
        return 'TAP version 13';
    };

    self.testCount = function () {
        return '1..' + (self.count_ + 1);
    };

    self.bailOut = function (reason) {
        return 'bail out!' + (reason !== null ? ' ' + reason : '');
    };

    self.skip = function (description) {
        self.count_ += 1;
        return self.genOutput_('ok', self.count_, '# SKIP ' + description);
    };

    self.notOk = function (description) {
        self.count_ += 1;
        return self.genOutput_('not ok', self.count_, '- ' + description);
    };

    self.ok = function (description) {
        self.count_ += 1;
        return self.genOutput_('ok', self.count_, '- ' + description);
    };

    self.count_ = 0;
}
