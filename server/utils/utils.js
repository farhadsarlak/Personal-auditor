const _ = require('lodash');

String.prototype.replaceAll = function (search, replace) {
    if (replace === undefined) {
        return this.toString();
    }

    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
}

let splitDate = (date) => {
    return _.split(date, '/');
}

let printRunLevel = (level) => {
    console.log(`*** ${String(level).toUpperCase()} ***`);
};

module.exports = {
    splitDate,
    printRunLevel
};