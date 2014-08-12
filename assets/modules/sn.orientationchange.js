/*jslint forin: true, sloppy: true, unparam: true, vars: true, white: true */
/*global document, jQuery, log, sn, lh, window */
/**
 * OrientationChangeEvent polyfill
 *
 * Normalizing the orientation-change event for the entire sn namespace
 * As Androids tend to fire a resize-event rather than an orientaitonchange
 * event we normalize the naming and bind the event to the sn-namespace
 * to avoid any 3rd party conflicts.
 *
 * In order to listen to the orientation change of a device, you can simply
 * bind an event-handler like this:
 * $(window).on("orientationchange.sn", function () {
 *    // YOUR EVENTHANDLER CODE GOES HERE
 * })
 *
 * Please note by default we debounce the resize event, in order to prevent
 * it from firing too often. The threshold is set to 450ms, because some
 * Androids are quite slow in the execution of the resize-handler.
 * If this delay is not approriate (fast enough) for your device-matrix,
 * feel free to lower the threshold as per your needs.
 *
 * @project Generic UI
 * @date 2013
 * @author Niklas Zillinger, Sapient GmbH
 * @licensor SapientNitro
 * @site miscellaneous
 */
var resizeTimer,
	supportsOrientationChangeEvent = (typeof window.orientation === 'number' && typeof window.onorientationchange === 'object');
if (!supportsOrientationChangeEvent) {
	window.addEventListener('resize', function () {
		/* as the resize event fires way too often, we debounce it ... */
		if (resizeTimer) {
			window.clearTimeout(resizeTimer);
		}
		/* ... so only the very last resize event calls out the orientation-change */
		resizeTimer = window.setTimeout(function () {
			jQuery(window).trigger("orientationchange.sn");
		}, 450);
	}, false);
}