/*jshint strict: false */
/*global sn: true, jQuery: true, testMode: true, log: true, Modernizr: true*/
/**
 * SapientNitro jQuery plugin for examplePlugin
 *
 * @dependencies:
 * - jquery.js
 *
 * @project Generic
 * @date 2014
 * @author SapientNitro
 * @site miscellaneous
 *
 *
 * Example (minimum) mark-up:
 *
 *
 */
/* grab the sn namespace or create one */
if (typeof window.sn === "undefined") {
    window.sn = {};
}
(function (window, document, $, sn) {
    'use strict';
    sn.examplePlugin = {
        /**
         * Default values
         *
         * @type {object}
         */
        options : {
            foo   : "bar"
        },
        /**
         * Constructor function for a single examplePlugin
         *
         * @see init()
         * @param {jQuery} Element which shall be used for the examplePlugin
         * @param {object} Optional parameters
         */
        construct : function (element, options) {
            var attributeOptions = element.data('examplePlugin-options');
            // Read options set on the element's data attribute, if it is set:
            this.options = $.extend({}, this.options, options, (attributeOptions && typeof attributeOptions === 'object') ? attributeOptions : {});
            // Default stuff
            this.element  = element;
            this.domElement = element.get(0);
            // Filter some elements
            // Init object
            this.init();
            return this;
        },
        /**
         * Init function
         *
         */
        init : function () {
            var self = this;
        }
    };
    sn.moduleController.register("examplePlugin", sn.examplePlugin, ".examplePlugin");
}(window, document, jQuery, window.sn));