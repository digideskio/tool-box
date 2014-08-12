/*jslint forin: true, sloppy: true, unparam: true, vars: true, white: true */
/*global document, jQuery, log, sn, lh, window */
/**
 * sn.footer.js
 *
 * Footer specific scripts, that attach interactive
 * behavior to elements in the footer.
 *
 * Please note: This is only for demo-reasons, in order
 * to demonstrate the binding of an pointer-event-handler.
 *
 * @dependencies:
 * - jquery.js
 * - sn.yapointer.js
 * - sn.pointertap.js
 *
 * @project Project Blueprint
 * @date 2012-12
 * @author MSCGN
 * @licensor SapientNitro
 * @site miscellaneous
 */
if(typeof window.sn === "undefined"){
    window.sn = {};
}
(function(window, document, $, sn) {

	sn.footer = (function () {

		'use strict';

		// initializing all footer functions and bindings
		var init = function(context) {
			var $context = context || $(document);
			// scroll back to top, when hitting the button
			$context.find("footer [data-top]").on("pointertap", function () {
				$("body, html").animate({
					"scrollTop": 0
				}, 300);
			});
		};

		/**
		 * Return public properties/methods
		 * @see www.wait-till-i.com/2007/08/22/again-with-the-module-pattern-reveal-something-to-the-world/
		 */
		return {
			init : init
		};
	}());
	sn.moduleController.register("footer", sn.footer, ["init"]);
}(window, document, jQuery, sn));