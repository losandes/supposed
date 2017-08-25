'use strict';

const printer = { print: console.log }; // require('./Printer.js')({ stream: { write: console.log } });
const styles = require('./console-styles.js');
const SYMBOLS = {
    passed: styles.green('✓ '), // heavy-check: '✔',
    failed: styles.red('✗ '), // heavy-x '✘',
    skipped: styles.yellow('⸕ '),
    info: styles.cyan('→ ')
};

module.exports = Reporter;

function Reporter () {
    var totals = {
        passed: 0,
        skipped: 0,
        failed: 0,
        broken: 0,
        startTime: null,
        endTime: null
    };

    function report (result) {
        switch (result.type) {
            case 'start':
                printer.print('Running tests...' + styles.newLine());
                totals.startTime = new Date();
                break;
            case 'startTest':
                break;
            case 'passed':
                totals.passed += 1;
                printSuccess(result.behavior);
                break;
            case 'skipped':
                totals.skipped += 1;
                printSkipped(result.behavior);
                break;
            case 'failed':
                totals.failed += 1;
                printError(result.behavior, result.error);
                break;
            case 'error':
                totals.broken += 1;
                printError(result.behavior, result.error);
                break;
            case 'end':
                totals.endTime = new Date();
                totals.total = totals.passed + totals.skipped + totals.failed + totals.broken;
                printTotals(totals);
                break;
        }
    }

    return {
        report: report
    };
}

function printSuccess (behavior) {
    printer.print(SYMBOLS.passed + behavior);
}

function printSkipped (behavior) {
    printer.print(SYMBOLS.skipped + behavior);
}

function printError (behavior, e) {
    printer.print(SYMBOLS.failed + behavior + styles.newLine());

    if (e && e.expected && e.actual) {
        printer.print('    expected: ' + styles.green(e.expected) + '    actual: ' + styles.red(e.actual) + styles.newLine());
    }

    printer.print(e);
    printer.print();
}

function printInfo (behavior, e) {
    printer.print(SYMBOLS.info + behavior + styles.newLine());

    if (e && e.expected && e.actual) {
        printer.print('    expected: ' + styles.green(e.expected) + '    actual: ' + styles.red(e.actual) + styles.newLine());
    }

    printer.print(e);
    printer.print();
}

function printTotals (totals) {
    var output = styles.newLine() + '    total: ' + styles.cyan(totals.total);
    output += '    passed: ' + styles.green(totals.passed);
    output += '    failed: ' + styles.red(totals.failed + totals.broken);
    output += '    skipped: ' + styles.yellow(totals.skipped);
    output += '    duration: ' + ((totals.endTime - totals.startTime)/1000) + 's' + styles.newLine();

    printer.print(output);
}
