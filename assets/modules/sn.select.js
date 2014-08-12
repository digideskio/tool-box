/*jshint browser:true,camelcase:true,curly:true,eqeqeq:true,forin:true,immed:true,jquery:true,latedef:true,maxparams:5,maxdepth:5,noarg:true,noempty:true,nonew:true,undef:true,unused:vars,strict:true */
/*!
 * Lufthansa NewUI Booking scripts, Lufthansa 2012/2013
 * Sapient GmbH, http://www.sapient.com/de-de/sapientnitro.html
 */
/**
 * Helper functions for LH NewUI Booking form elements
 * provides general interaction enhancements and
 * individual eventhandlings for specific elements
 *
 * @dependencies:
 * - jquery-2x
 *
 * @project Lufthansa NewUI Booking
 * @date 2013-12
 * @author Holger Hellinger, Sapient GmbH
 * @licensor Lufthansa
 * @site miscellaneous
 *
 *
 * Example (minimum) mark-up:
 * The tags are negligible, but the hierarchie of the classes
 * and data-attributes is required:
 * <div class="custom-select interactive-element">
 *  <!-- optional <output>Nürnberg</output> -->
 *  <select class="" data-placeholder="choose" id="" name="dest">
 *      <option value="GWT">Westerland / Sylt</option>
 *  </select>
 * </div>
 *
 */

/* grab the sapient nitro (sn) namespace or create one */
if(typeof window.sn === "undefined"){
    window.sn = {};
}
(function(window, document, $, sn) {

    'use strict';

    sn.select = (function () {
        /**
         * custom selectbox
         *
         * Select Boxes are designed with individual handles.
         * So in Case of JS Available we hide them visually and add the text outside to a
         * <output> element generate on the fly.
         */
        var initCustomSelectInfos = function () {
            var customSelectSelector = ".custom-select";

            $(customSelectSelector).each(function(i, elem){
                var $elem = $(elem),
                    customSelect = $elem.find("select"),
                    option = customSelect.find("option:selected"),
                    output = $elem.find("output");
                if (output.length > 0) {
                    output.empty().html(option.text());
                } else {
                    $elem.prepend('<output>' + option.text() + '</output>');
                }
            });
        };

        // controller for initializing all lh form helper functions
        var init = function(context) {
            var $context = context || $(document);

            // initialize custom selects with info-box
            initCustomSelectInfos();


            $context.find(".custom-select select").on("change", function (e) {
                var $this = $(this),
                    innerOption = $this.find("option:selected");
                $this.prev("output").html(innerOption.text());
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
    sn.moduleController.register("select", sn.select, ["init"]);
}(window, document, jQuery, sn));