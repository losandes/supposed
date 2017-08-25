'use strict';
const styles = require('./console-styles.js');

module.exports = Printer;

function Printer (options) {
    var self;
    options = Object.assign({}, options);

    self = {
        print: print,
        stream: options.stream || process.stdout,
        tail: options.tail || '',
        raw: options.raw
    };

    function print () {
        const args = Array.prototype.slice.call(arguments);
        var output = [];

        args.forEach(arg => {
            if (typeof arg === 'string') {
                output.push(arg);
            } else if (typeof arg === 'object') {
                if (arg.message) {
                    output.push('  ' + arg.message);
                }

                if (arg.stack) {
                    output.push('  ' + arg.stack);
                }
            }
        });

        return self.stream.write(output.join('\n') + self.tail);
    }

    Object.freeze(self);
    return self;
}




// this.result = function (event) {
//     var result = [], buffer = [], time = '', header;
//     var complete = event.honored + event.pending + event.errored + event.broken;
//     var status = (event.errored && 'errored') || (event.broken && 'broken') ||
//                  (event.honored && 'honored') || (event.pending && 'pending');
//
//     if (event.total === 0) {
//         return [$("Could not find any tests to run.").bold.red];
//     }
//
//     event.honored && result.push($(event.honored).bold + " honored");
//     event.broken  && result.push($(event.broken).bold  + " broken");
//     event.errored && result.push($(event.errored).bold + " errored");
//     event.pending && result.push($(event.pending).bold + " pending");
//
//     if (complete < event.total) {
//         result.push($(event.total - complete).bold + " dropped");
//     }
//
//     result = result.join(' ∙ ');
//
//     header = {
//         honored: '✓ ' + $('OK').bold.green,
//         broken:  '✗ ' + $('Broken').bold.yellow,
//         errored: '✗ ' + $('Errored').bold.red,
//         pending: '- ' + $('Pending').bold.cyan
//     }[status] + ' » ';
//
//     if (typeof(event.time) === 'number') {
//         time = ' (' + event.time.toFixed(3) + 's)';
//         time = this.stylize(time, 'grey');
//     }
//     buffer.push(header + result + time + '\n');
//
//     return buffer;
// };

// this.error = function (obj) {
//     var string  = '✗ ' + $('Errored ').red + '» ';
//         string += $(obj.error).red.bold                         + '\n';
//         string += (obj.context ? '    in ' + $(obj.context).red + '\n': '');
//         string += '    in ' + $(obj.suite.subject).red          + '\n';
//         string += '    in ' + $(obj.suite._filename).red;
//
//     return string;
// };
//
// this.contextText = function (event) {
//     return '  ' + event;
// };
//
// this.vowText = function (event) {
//     var buffer = [];
//
//     buffer.push('   ' + {
//         honored: ' ✓ ',
//         broken:  ' ✗ ',
//         errored: ' ✗ ',
//         pending: ' - '
//     }[event.status] + this.stylize(event.title, ({
//         honored: 'green',
//         broken:  'yellow',
//         errored: 'red',
//         pending: 'cyan'
//     })[event.status]));
//
//     if (event.status === 'broken') {
//         buffer.push('      » ' + event.exception);
//     } else if (event.status === 'errored') {
//         if (event.exception.type === 'emitter') {
//             buffer.push('      » ' + this.stylize("An unexpected error was caught: " +
//                            this.stylize(event.exception.error, 'bold'), 'red'));
//         } else {
//             buffer.push('    ' + this.stylize(event.exception, 'red'));
//         }
//     }
//     return buffer.join('\n');
// };
