/*jslint forin: true, sloppy: true, unparam: true, vars: true, white: true */
/*global document, jQuery, log, sn, window, DocumentTouch */
/**
 * pointerType tests
 * provides a list of detection test for determining
 * available input methods of a device
 *
 * @project Generic
 * @date 2013-06
 * @author Sapient GmbH, Mobile Experience Studio CGN
 * @licensor SapientNitro
 * @site misc
 * @version 1.0
 */

/* grab the sapient nitro (sn) namespace or create one */
if (window.sn === undefined) {
    window.sn = {};
}

(function(window, document, sn) {
	sn.pointerType = {
		/**
		 * check for pointer type = touch
		 */
		isTouch : function () {
			return (typeof window.ontouchstart === 'object' || (window.DocumentTouch && document instanceof DocumentTouch));
		},
		/**
		 * check for pointer type = msPointer
		 */
		isMSPointer : function () {
			return window.navigator.msPointerEnabled;
		},
		/**
		 * check for pointer type = pointer (W3C)
		 */
		isPointer : function () {
			return window.navigator.pointerEnabled;
		},
		/**
		 * check for pointer type = mouse
		 * NOTE: a mouse object constructor always exists (also on an ipad),
		 *       this test is only for covering all methods in here
		 */
		isMouse : function () {
			return (typeof window.onmousedown === 'object' || window.MouseEvent);
		}
	};
}(window, document, sn));
