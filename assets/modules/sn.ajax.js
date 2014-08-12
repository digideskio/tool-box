/*jslint forin: true, sloppy: true, unparam: true, vars: true, white: true */
/*global document, jQuery, log, sn, window */
/*!
 * Generic UI scripts
 * Sapient GmbH, http://www.sapient.com/de-de/sapientnitro.html
 */
/**
 * Core functions for Generic UI
 * provides a general initialisation container to
 * hook custom scripts in
 *
 * @dependencies:
 * - jquery-2.0.0.min.js
 * - sn.config.js
 *
 * @project Generic UI
 * @date 2013
 * @author Holger Hellinger, Sapient GmbH
 * @licensor SapientNitro
 * @site miscellaneous
 */

/* grab the sapient nitro (sn) namespace or create one */
if (typeof window.sn === "undefined") {
    window.sn = {};
}
(function(window, document, $, sn) {

	sn.ajax = (function () {
		
		'use strict';
		
		/*
			Function: showLoader

				Shows loader
		*/
		var showLoader = function () {
			$("body").addClass("ajax-loading");
		};


		/*
			Function: hideLoader

				Hides loader
		*/
		var hideLoader = function () {
			$("body").removeClass("ajax-loading");
		};


		/*
			Function: handleGeneralError

				Behandelt den Generellen Asynchronen Fehler der auftreten kann

			Parameters:

				XMLHttpRequest - The XMLHttpRequest.
				textStatus - The Status message.
				errorThrown - Thrown error.
				theUrl - Service called.
		*/
		var handleGeneralError = function (XMLHttpRequest, textStatus, errorThrown, theUrl) {
			hideLoader();
			var logMessage = "handleGeneralError: XMLHttpRequest:"+XMLHttpRequest+"\n textStatus:"+textStatus+"\n errorThrown:"+errorThrown + "\n theUrl:" +  theUrl + ":";
			if (sn.lh.config && sn.lh.config.error.showErrors === true) {
				window.alert(logMessage);
			}
		};


		/*
			Function: loadData

				Generic Ajax Loader which provides a class set for showing the loading state, handles the result which is returned after success.

			Parameters:

				opt.service - Service Path
				opt.data - Optional Data String
				opt.showLoader - Should we show the loader?
				opt.type - Switch for Type of request
				opt.dataType - Format of the result transmitted from the server

			Returns:

				JSON

			Usage:
				(start code)
				var opt = {
					service : "/service",
					data : "{data}",
					showLoader: true,
					type : "POST",
					dataType : "HTML"
				}
				sn.ajax.loadData(opt);
				(end)
		*/
		var loadData = function(opt) {
			var urlStr = opt.service,
				dataStr = "",
				blnShowLoader = true,
				postType = opt.type || "POST", // Type set, fallback post?
				dataType = opt.dataType || "JSON"; // Type set, fallback JSON?
			//if json stringify
			if (typeof opt.data === "object") {
				dataStr = JSON.stringify(opt.data) || "";
			} else {
				dataStr = opt.data || "";
			}

			if (typeof opt.showLoader === "boolean" && opt.showLoader === false) {
				blnShowLoader = false;
			}


			return $.ajax({
				url: urlStr,
				type: postType,
				cache: false,
				data: dataStr,
				dataType: dataType,
				beforeSend: function(xhr) {
					if (blnShowLoader === true) {
						showLoader();
					}
				},
				success: function(result){
					if (blnShowLoader === true) {
						hideLoader();
					}
					return result;
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					handleGeneralError(XMLHttpRequest, textStatus, errorThrown, urlStr);
					return false;
				}
			});
		};


		/**
		 * Return public properties/methods
		 * @see www.wait-till-i.com/2007/08/22/again-with-the-module-pattern-reveal-something-to-the-world/
		 */
		return {
			loadData   : loadData,
			showLoader : showLoader,
			hideLoader : hideLoader
		};
	}());
}(window, document, jQuery, sn));