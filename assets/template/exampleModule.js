/*jshint strict: false */
/*global sn: true, jQuery: true, testMode: true, log: true, Modernizr: true*/
/**
 * exampleModule
 *
 * Please explain trhe usage here:
 *
 * @dependencies:
 * - jquery
 * - sn.moduleController.js
 *
 * @project Generic
 * @date 2013-06
 * @author SapientNitro
 * @licensor SapientNitro
 * @site misc
 * @version 1.0
 */

/* grab the sn namespace or create one */
if (typeof window.sn === "undefined") {
    window.sn = {};
}

(function (window, document, $, sn) {

    'use strict';

    sn.exampleModule  = (function () {

        /**
         * Define Scope Variables here
         */
        var example = {
            foo   : "bar"
        };

        /**
         * detect exampleModule type
         */
        var exampleFunction = function () {
            //Create your Methods here
        };



        /**
         * controller for initializing all special exampleModule event handlers
         */
        var init = function (context) {
            var $context = context || $(document);
        };


        /**
         * Return public properties/methods
         * @see www.wait-till-i.com/2007/08/22/again-with-the-module-pattern-reveal-something-to-the-world/
         */
        return {
            init : init
        };
    }());

    sn.moduleController.register("exampleModule", sn.exampleModule, ["init"]);
}(window, document, jQuery, window.sn));