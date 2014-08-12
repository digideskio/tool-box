/*jslint forin: true, sloppy: true, unparam: true, vars: true, white: true */
/*global document, jQuery, sn, window */
/**
 * sn.pointertap.js
 *
 * This script enables the binding of a tap-event as
 * a jquery special-event.
 * The motivation for the tap-event is a faster
 * interaction (response) with UI elements, by cutting
 * off the 300ms delay, which touch devices hold for
 * the common 'click' event.
 * The script is greatly inspired by google's fastbutton
 * implementation, which is described here:
 * https://developers.google.com/mobile/articles/fast_buttons
 *
 * The binding works as any other jquery event-binding:
 * $("#mybutton").on("pointertap", function (e) {
 *		// YOUR EVENTHANDLER CODE GOES HERE
 * });
 *
 * Please note:
 * As the pointertap event is realized by immediately handling
 * a queue of touch-events there is still a 'click' event fired
 * at the end of this queue. The preventGhostClick function tries
 * to block that event by temporarily storing the coordinates of
 * the event target.
 * However, there might still be problems with handling the
 * pointertap-event within overlays (modal layers).
 * For example, when an overlay closes on 'pointertap' - the
 * associated 'click' event will be fired  on the underlying element.
 * If this 'click' event is not handled on the document-level (default),
 * but through delegation from a parent-element, the preventGhostClick
 * function won't work. In this case, the ghostclick handling must also
 * happen within the parent-delegation function.
 * Sum up: Use the pointertap-event with caution on overlays or consider
 * alternatives like binding the overlay close event to a normal 'click'.
 *
 *
 * @dependencies:
 * - jquery-2.x
 * - sn.yapointer.js
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

(function (window, document, $, sn) {
    var coordinates = [],
        preventGhostClick = function (x, y) {

            coordinates.push(x, y);
			/*
			* release coords after short delay to enable
			* clicks for that region again
			*/
            window.setTimeout(function () {
                coordinates.splice(0, 2);
            }, 1000);
        };

	/*
	* check all stored coords which we want to ignore
	* for that click (inside 25 px threshold)
	*/
    $(document).on('click', function (e) {
		var i, l = coordinates.length;
        for (i = 0; i < l; i += 2) {
            if (Math.abs(e.clientX - coordinates[i]) < 25 &&
                Math.abs(e.clientY - coordinates[i + 1]) < 25) {

                e.stopPropagation();
                e.preventDefault();
            }
        }
    });

	/*
	* attach the 'pointertap' as a jquery special event
	*/
    $.event.special.pointertap = {
        setup: function (data, namespaces, eventHandle) {

            this.mnsPstate = 0;
            this.clickDone = 0;
            this.clickTimeOut = null;
            $(this)
                .on("pointerdown", function () {
                    this.mnsPstate = 1;
                })
                .on("mousedown mouseup", function (e) {
                    e.preventDefault();
                })
                .on("pointerup", function (e) {
                    this.mnsPstate = 0;
                    this.clickDone = 1;
                    $(this).trigger("pointertap", e);
                    if (e.normalized) {
                        preventGhostClick(e.normalized.clientX, e.normalized.clientY);
                    }
                })
                .on("pointercancel pointerout", function () {
                    this.mnsPstate = 0;
                })
                .on("click", function (e) {
                    var $this = this;
                    e.stopPropagation();
                    e.preventDefault();
                    if (!$this.clickDone) {
                        $this.clickDone = 1;
                        $($this).trigger("pointertap", e);
                    }
                    $this.clickTimeOut = window.setTimeout(function () {
                        $this.clickDone = 0;
                        window.clearTimeout($this.clickTimeOut);
                    }, 301);
                });
        },

        teardown: function () {
            $(this).off("pointerdown pointerup pointercancel pointerout click mousedown mouseup");
        }
    };

}(window, document, jQuery, sn));