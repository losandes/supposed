//jshint strict:false
module.exports = new Styles();

function Styles (options) {
    var self = {
        newLine: function () {
            return '\n';
        }
    };
    const STYLES = [
        { name: 'bold'      , value: [1,  22] },
        { name: 'italic'    , value: [3,  23] },
        { name: 'underline' , value: [4,  24] },
        { name: 'cyan'      , value: [96, 39] },
        { name: 'yellow'    , value: [33, 39] },
        { name: 'green'     , value: [32, 39] },
        { name: 'red'       , value: [31, 39] },
        { name: 'grey'      , value: [90, 39] },
        { name: 'green-hi'  , value: [92, 32] }
    ];
    options = Object.assign({}, options);

    STYLES.forEach(style => {
        self[style.name] = function (input) {
            if (options.noColor) {
                return input;
            }
            return '\033[' + style.value[0] + 'm' + input +
                '\033[' + style.value[1] + 'm';
        };
    });

    Object.freeze(self);
    return self;
}
