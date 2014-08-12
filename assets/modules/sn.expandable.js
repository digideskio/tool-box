/*jshint browser:true,camelcase:true,curly:true,eqeqeq:true,forin:true,immed:true,jquery:true,latedef:true,maxparams:5,maxdepth:5,noarg:true,noempty:true,nonew:true,undef:true,unused:vars,strict:true */
/**
 * SapientNitro jQuery plugin for expandable
 *
 * @dependencies:
 * - jquery-2.0.2.min.js
 *
 * @project Generic
 * @date 2013
 * @author Niklas Zillinger, Sapient GmbH
 * @author Holger Hellinger, Sapient GmbH
 * @site miscellaneous
 *
 *
 * Example (minimum) mark-up:
 * The tags are negligible, but the hierarchie of the classes
 * and data-attributes is required:
 * <div class="expandable" data-expandable-state="[open || close]">
 *     <a href="#[bodyID]" class="expandable-header"></a>
 *     <div id="[bodyID]" class="expandable-body">
 *         <div class="expandable-content"></div>
 *     </div>
 * </div>
 *
 * Now the expandable could be initialised like this (see end of this file),
 * options don't need to be set, if defaults are used:
 * jQuery('.expandable').expandable({
 *     headerSelector   : ".expandable-header",
 *     bodySelector     : ".expandable-body",
 *     contentSelector  : ".expandable-content",
 *     openClass        : "expandable-open",
 *     closeClass       : "expandable-close",
 *     stateKey         : "expandableState",
 *     openState        : "open",
 *     closeState       : "close",
 *     bodyHeightKey    : "bodyHeight",
 *     orientationDelay : 300
 * });
 *
 * [headerSelector] {string}
 * CSS selector to identify the expandable header (click/tap target)
 * of the expandable module
 * default: ".expandable-header"
 *
 * [bodySelector] {string}
 * CSS selector to identify the expandable body, which defines the
 * collapsable/extendable element of the module
 * default: ".expandable-body"
 *
 * [contentSelector] {string}
 * CSS selector to identify the expandable content, that defines the
 * exact height of the expandable body (for smooth collapsing)
 * default: ".expandable-content"
 *
 * [openClass] {string}
 * CSS class to assign when expandable is open, in order to serve as
 * a hook for accordant style rules
 * default: "expandable-open"
 *
 * [closeClass] {string}
 * CSS class to assign when expandable is closed, in order to serve as
 * a hook for accordant style rules
 * default: "expandable-close"
 *
 * [stateKey] {string}
 * key string for the internal data-object representation (assigned
 * to the DOM element), in order to hold the current state of the
 * expandable module (open/close)
 * default: "expandableState"
 *
 * [bodyHeightKey] {string}
 * key string for the internal data-object representation (assigned
 * to the DOM element), in order to cache the exact body height for
 * the current viewport-size for minimizing calculation & DOM access
 * default: "bodyHeight"
 *
 * [openState] {string}
 * value string for the internal data-object representation (assigned
 * to the DOM element), when expandable module is in open state
 * default: "open"
 *
 * [closeState] {string}
 * value string for the internal data-object representation (assigned
 * to the DOM element), when expandable module is in close state
 * default: "close"
 *
 * [orientationDelay] {integer}
 * delay in ms to wait before recalculating the expandable-module (e. g.
 * bodyHeight) after an orientation-change has happened, in order to
 * to give browsers enough time for the native resize-rendering and
 * calculation, which will return more reliable values
 * default: 300
 *
 *
 * NOTE:
 * There is no animation included in this plugin.
 * It's recommended to animate the expanding/collapsing with CSS3, which
 * will fallback to a non-animated behaviour on non capable browsers.
 * All stylings should be defined in CSS with the provided hooks.
 *
 */

/* grab the sapient nitro (sn) namespace or create one */
if(typeof window.sn === "undefined"){
    window.sn = {};
}
(function(window, document, $, sn) {

    'use strict';

    sn.expandable = {

        /**
         * Default values
         *
         * @type {object}
         */
        options : {
            headerSelector   : ".expandable-header",
            bodySelector     : ".expandable-body",
            contentSelector  : ".expandable-content",
            openClass        : "expandable-open",
            closeClass       : "expandable-close",
            openState        : "open",
            closeState       : "close",
            stateKey         : "expandableState",
            bodyHeightKey    : "bodyHeight",
            orientationDelay : 600,
            scrollIntoView   : false,
            useSecondRow     : false,
            secondRowTitle   : ""
        },


        /**
         * Constructor function for a single expandable
         *
         * @see init()
         * @param {jQuery} Element which shall be used for the expandable
         * @param {object} Optional parameters
         */
        construct : function(element, options) {
            var attributeOptions = element.data('expandable-options');

            // Read options set on the element's data attribute, if it is set:
            this.options = $.extend({}, this.options, options, (attributeOptions && typeof attributeOptions === 'object') ? attributeOptions : {});

            // Default stuff
            this.element  = element;
            this.domElement = element.get(0);
            // Filter some elements
            this.header = this.element.find(this.options.headerSelector).first();
            this.body = this.element.find(this.options.bodySelector).first();
            this.bodyContent = this.body.find(this.options.contentSelector).first();
            this.state = this.element.data(this.options.stateKey);
            // Init object
            this.init();
            return this;
        },



        /**
         * Opens the expandable
         */
        open : function() {
            // Set ARIA attributes
            this.header.attr("aria-expanded", "true");
            this.body.attr("aria-expanded", "true");

            // save state
            this.element.data(this.options.stateKey, this.options.openState);
            this.state = this.options.openState;

            // Check if a height has been set. Otherwise determine the height
            // before opening the expandable.
            var height = this.element.data(this.options.bodyHeightKey);
            if (!height) {
                this.body.show();
                this.determineBodyHeight();
                height = this.element.data(this.options.bodyHeightKey);
            }

            // Open body
            this.body.css({
                "height" : height
            });
            this.element.removeClass(this.options.closeClass).addClass(this.options.openClass);

            this.element.trigger('open');

            // Wait 700ms (until the height of the expandable is set)
            // and scroll element into viewport
            if (this.options.scrollIntoView) {
                window.setTimeout($.proxy(function(){
                    $('html, body').animate({
                        scrollTop: this.element.offset().top
                    }, 'fast');
                }, this), 700);
            }

        },



        /**
         * Closes the expandable
         * @param  {Boolean} noEvent Flag indicating if the "close" event should be omitted
         */
        close : function(noEvent) {
            // Set ARIA attributes
            this.header.attr("aria-expanded", "false");
            this.body.attr("aria-expanded", "false");

            // Close body
            this.body.css({
                "height" : ""
            });
            this.element.removeClass(this.options.openClass).addClass(this.options.closeClass);

            if (noEvent !== true) {
                this.element.trigger('close');
            }

            // save state
            this.element.data(this.options.stateKey, this.options.closeState);
            this.state = this.options.closeState;
        },



        /**
         * The toggle event when user clicks/taps on the expandabel-header
         *
         * Opens/closes the body and sets the active class on the
         * container.
         *
         * @param {event} e The jQuery click/tap event object
         */
        toggleState : function(e) {
            // Prevent default behavior
            if (e) {
                e.preventDefault();
            }

            // get current state
            this.state = this.element.data(this.options.stateKey);

            // Open/close body
            if (this.state === this.options.closeState) {
                this.open();
            } else {
                this.close();
            }
        },



        /**
         * determine the total height of the expandable-content (inkl. margin)
         * in order to set it to the expandable-body for assuring a smooth open/close animation
         */
        determineBodyHeight : function () {
            // determine body content height
            if (this.state === this.options.openState) {
                this.element.data(this.options.bodyHeightKey, this.bodyContent.outerHeight(true));

                this.body.css({
                    "height" : this.element.data(this.options.bodyHeightKey)
                });
            } else {
                this.element.data(this.options.bodyHeightKey, null);
            }
        },


        /**
         * Init function
         *
         * Filters header & body element. determines the body height for
         * smooth animations.
         * Binds the events for toggle (tap) and orientation changes in
         * order to keep expandables stable in different contexts.
         */
        init : function() {
            var self = this;

            // Cancel if any element is missing
            if (!this.header.length || !this.body.length || !this.bodyContent.length) {
                return;
            }

            // if there is no initial state assigned, we consider it closed
            if (this.state === undefined) {
                this.element.data(this.options.stateKey, this.options.closeState);
                this.state = this.options.closeState;
            }

            // Determine height dynamically ...
            window.setTimeout($.proxy(this.determineBodyHeight, this), 20);

            // ... and with every orientation change (is a resize event in some browsers)
            $(window).on("orientationchange.sn", function (){
                // as the resize event fires way too often, we debounce it ...
                if(self.resizeTimer) {
                    window.clearTimeout(self.resizeTimer);
                }
                // ... so only the very last resize event kicks off the body height determination
                self.resizeTimer = window.setTimeout(function (){
                    self.determineBodyHeight();
                }, self.options.orientationDelay);
            });

            // Bind click/tap event to header
            this.header.on("click.sn", function(e) {
                self.toggleState(e);
            });

            // Open/close expandable initially
            if (this.state === this.options.closeState) {
                this.close(true);
            } else {
                this.open();
            }
        }
    };
    sn.moduleController.register("expandable", sn.expandable, ".expandable");
}(window, document, jQuery, sn));