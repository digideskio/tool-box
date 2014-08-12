/**
 * Defines shims for JS language features the may be used in sh.*.js files.
 */
(function () {
    "use strict";
    /*  making sure we have an Object.create function available */
    if (typeof Object.create !== 'function') {
        Object.create = function (o) {
            function F() {}
            F.prototype = o;
            return new F();
        };
    }
})();