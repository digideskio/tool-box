/*jslint forin: true, sloppy: true, unparam: true, vars: true, white: true */
/*global document, jQuery, log, sn, window */
/**
 * sn.touchable.js
 * assigns an onTouch class to all elements,
 * matching the accordant selection. This class can be
 * used for highlighting elements upon user-action and
 * apply a more appealing interactive behavior to it.
 *
 * If you want to overwrite the default options, you can
 * pass an accordant object to the init-function:
 * sn.touchable.init({
 *     touchableSelector : ".YOUR_SELECTOR",
 *     onTouchClass : "YOUR_ON_TOUCH_CLASS"
 * }):
 *
 * [touchableSelector] {string}
 * CSS selector to identify the elements that shall receive an
 * interactive behavior with an onTouchClass
 * default: ".sn-touchable"
 *
 * [onTouchClass] {string}
 * CSS class that shall be assigned when a touch/hover event
 * occurs, based on this class Stylings or further functions
 * can be assigned
 * default: "touch"
 *
 * @dependencies:
 * - jquery-2.x
 * - sn.pointerType.js
 * - sn.yapointer.js
 *
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

    sn.touchable = (function () {

		'use strict';

		/**
		 * Default values
		 *
		 * @type {object}
		 */
		var options = {
			touchableSelector : ".sn-touchable",
			onTouchClass      : "touch"
		};

		/**
		 * controller for initializing all touchable elements
		 * to receive an onTouchClass when touched/hovered
		 *
		 * @param [context] context for the initialisation. Optional.
		 */
		var init = function () {
			/**
			 * bind pointerevents to set/remove onTouch class
			 *
			 * Note: pointerover & pointerout only exist for
			 * pointerType mouse - for every other pointerType
			 * this event-binding is simply ignored
			 */
			$("body")
			.on("pointerdown pointerover", options.touchableSelector, function(e) {
				$(this).addClass(options.onTouchClass);
			})
			.on("pointerup pointercancel pointerout", options.touchableSelector, function(e) {
				$(this).removeClass(options.onTouchClass);
			});

			/**
			 * we only bind the move event for pointer/touch
			 * devices, because the classcical mousemove event fires way
			 * to often and is not properly handled for this use-case
			 */
			if(sn.pointerType.isTouch() || sn.pointerType.isPointer() || sn.pointerType.isMSPointer()) {
				$("body").on("pointermove", options.touchableSelector, function(e) {
					$(this).removeClass(options.onTouchClass);
				});
			}
        };

        /**
         * Return public properties/methods
         * @see www.wait-till-i.com/2007/08/22/again-with-the-module-pattern-reveal-something-to-the-world/
         */
        return {
            init : init
        };

    }());

	sn.moduleController.register("touchable", sn.touchable, ["init"]);
}(window, document, jQuery, sn));