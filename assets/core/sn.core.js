/**
 * Core stuff.
 *
 * Defines functions within "sn.core" namespace.
 *
 * All this file is expected to be loaded as FIRST, before any other sn.*.js files.
 */
(function () {
    "use strict";

    // create the "sn" namespace
    if (typeof window.sn === "undefined") {
        window.sn = {};
        window.sn.core = {};
    }

    window.sn.core = {
        /**
         * Ensures that a new namespace under the "sn" namespace is defined.
         * If already defined, the original namespace is returned.
         *
         * @param {string | string[]} name - The name of the new namespace.
         * @param {object} [container] - Optional container to create the namespace within. Default is "window.sn".
         * @return {*} the new namespace object or the reference to whatever the given name points to.
         */
        defineNamespace: function (name, container) {
            if (Object.prototype.toString.apply(name) !== '[object Array]') {
                name = name.split(".");
            }
            var currentPartName = name[0];
            if (undefined === container) {
                container = window.sn;
            }
            if (typeof container[currentPartName] === "undefined") {
                container[currentPartName] = {};
            }
            if (name.length > 1) {
                return window.sn.core.defineNamespace(name.splice(1), container[currentPartName]);
            } else {
                return container[currentPartName];
            }
        },

        /**
         * Fetches a reference to an object by analyzing a path given as dot-delimited string.
         * @example
         *
         * getObjectAt("com.foo.bar) => [Object object]
         * getObjectAt("com.foo.bar)() // calls a function
         *
         * NOTE: If a path without a dot "." is given, a reference within "sn.lh.helper" is used. So getObjectAt("foo")
         * will return "sn.lh.helper.foo".
         * This usage is DEPRECATED and will be removed in the near future. After the change getObjectAt("foo") will
         * return "window.foo".
         *
         * @param objectPath {string} - The path specification of the object to fetch.
         * @param [defaultValue] {any} - Optional default value to be returned if there is nothing found at the given path.
         * @returns {*} Whatever is found at the given path or the given defaultValue if the given path does not point
         * to something reachable.
         */
        getObjectAt: function (objectPath, defaultValue) {
            var i,
                context = window,
                parts = objectPath.split("."),
                partLength = parts.length;
            if (partLength === 1) {
                return sn.lh.helper[objectPath];
            }
            for (i = 0; i < partLength; i = i + 1) {
                if (typeof context[parts[i]] === "undefined") {
                    if(arguments.length < 2){
                        throw new Error("Could not find '" + parts[i] + "' of path " + objectPath);
                    }else{
                        return defaultValue;
                    }
                }
                context = context[parts[i]];
            }
            return context;
        }
    };
})();