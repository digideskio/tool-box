/*jslint forin: true, sloppy: true, unparam: true, vars: true, white: true */
/*global document, jQuery, log, sn, window */
/**
 * yet another pointer (yap[ointer]) script
 * this is script is greatly inspired (amongst other scripts) by:
 * https://github.com/borismus/pointer.js/
 *
 * nevertheless all solutions that can be found tend to either overbind
 * handlers (unneccessary) or override native js functionality (scary)
 *
 * as jQuery is usually a de facto standard in creating modern websites
 * this pointer script simply registers the pointer-event (W3C name) as
 * special event on the jQuery object (special event API). This enables
 * the usage of pointerevents like "normal" events while the mapping to
 * the "real" event (mouse, touch, ...) has happened on load.
 *
 * In order to enable the pointer-events, this script has to be
 * initialised with:
 * sn.pointer.init();
 *
 * After that, the usage is:
 * $("body").on("pointerdown", "a", {some:customData}, function(e){
 *     // some event handling (based on the device's input method) for
 *     // mousedown / touchstart / MSPointerDown / pointerdown
 * });
 *
 * The benefit of leveraging the jQuery event API is, that delegation
 * and custom data binding works as usual.
 * If one day the W3C pointer-event has better cross-browser support,
 * this script can (hopefully) simply removed without affecting the site.
 *
 * For easing the work with eventData (e. g. X/Y coordinates) this script
 * attaches a "normalized" object to the event object, where some of the
 * eventData can be accessed through a common interface.
 * See function [normalizeEvent].
 * The decision was to keep it as simple (and small) as possible. Thus
 * there is only a few data available. When more data is required, the
 * "normalized"-object can simply be extended for specific project needs.
 * For a start the object provides the following data:
 *
 * $("body").on("pointerdown", "a", {some:customData}, function(e){
 *     // [e.normalized.clientX]
 *     //      clientX coordinates
 *     // [e.normalized.clientY]
 *     //      clientY coordinates
 *     // [e.normalized.pointerTarget]
 *     //      initial target where the event was triggered
 *     // [e.normalized.pointer]
 *     //      original event-object of the pointer (mouse/touch, ...)
 * });
 *
 *
 * @dependencies:
 * - jquery
 * - sn.pointerType.js
 *
 * @project Generic
 * @date 2013-06
 * @author Sapient GmbH, Mobile Experience Studio CGN
 * @licensor SapientNitro
 * @site misc
 * @version 1.0
 */

/* grab the sapient nitro (sn) namespace or create one */
if (typeof window.sn === "undefined") {
    window.sn = {};
}

(function(window, document, $, sn) {

    sn.pointer  = (function () {

        'use strict';

        /**
         * map native event to our custom pointer object
         * default: mouse (saves us one condition loop)
         *
         * [1] mouseover/-out are currently only set for
         *     the sake of completeness - there is just a valid
         *     use case for "single-mouse" environments. Thus no
         *     special-event adaption happens.
         */
        var pType = {
            pointerdown   : "mousedown",
            pointerup     : "mouseup",
            pointermove   : "mousemove",
            pointercancel : "mouseout",
            pointerover   : "mouseover", /* [1] */
            pointerout    : "mouseout"   /* [1] */
        };

        /**
         * detect pointer type
         */
        var detectPointerType = function () {
            if (sn.pointerType.isPointer()) {
                // W3c pointer device
                sn.pointer.pType = {
                    pointerdown   : "pointerdown",
                    pointerup     : "pointerup",
                    pointermove   : "pointermove",
                    pointercancel : "pointercancel"
                };
            } else if (sn.pointerType.isTouch()) {
                // touch device
                sn.pointer.pType = {
                    pointerdown   : "touchstart",
                    pointerup     : "touchend",
                    pointermove   : "touchmove",
                    pointercancel : "touchcancel"
                };
            } else if (sn.pointerType.isMSPointer()) {
                // msPointer device
                sn.pointer.pType = {
                    pointerdown   : "MSPointerDown",
                    pointerup     : "MSPointerUp",
                    pointermove   : "MSPointerMove",
                    pointercancel : "MSPointerCancel"
                };
            }
        };

        /**
         * normalize event data for consistent access
         *
         * @param [e] - event object passed by jQuery's special event handler
         */
        var normalizeEvent = function (e) {
            var eObj = e.originalEvent,
                pointer = eObj.changedTouches ? eObj.changedTouches[0] : (eObj || e);
                e.normalized = {
                    clientX : pointer.clientX,
                    clientY : pointer.clientY,
                    pointerTarget : pointer.target,
                    pointer : pointer
                };
            return e;
        };

        /**
         * event handler (helper) for jQuery special event handling
         * IT'S CRUCIAL TO CALL THE METHODS VIA THE OBJECT-NOTATION (sn.pointer.normalizeEvent())
         * BECAUSE OF THE AUGMENTED/CHANGED CONTEXT WHEN EVENTS ARE FIRED AND HANDLED BY jQUERY
         *
         * @param [e] - event object passed by jQuery's special event handler
         */
        var handleEvent = function (e) {
            var normEvent = sn.pointer.normalizeEvent(e);
            return normEvent.handleObj.handler.apply( this, arguments );
        };


        /**
         * controller for initializing all special pointer event handlers
         */
        var init = function () {
            var key;
            /* detect the device's pointer type */
            detectPointerType();

            // register all pointer-events as a special jQuery event
            for (key in sn.pointer.pType) {
                $.event.special[key] = {
                    bindType: sn.pointer.pType[key],
                    delegateType: sn.pointer.pType[key],
                    handle: handleEvent
                };
            }
        };


        /**
         * Return public properties/methods
         * @see www.wait-till-i.com/2007/08/22/again-with-the-module-pattern-reveal-something-to-the-world/
         */
        return {
            init : init,
            pType : pType,
            normalizeEvent : normalizeEvent,
            detectPointerType : detectPointerType
        };
    }());

    sn.moduleController.register("pointer", sn.pointer, ["init"]);
}(window, document, jQuery, sn));