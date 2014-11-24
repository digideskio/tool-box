/*jshint browser:true,camelcase:true,curly:true,eqeqeq:true,forin:true,immed:true,jquery:true,latedef:true,maxparams:5,maxdepth:5,noarg:true,noempty:true,nonew:true,undef:true,unused:vars,strict:true */
/**
 * sn.maps.js
 *
 * @dependencies:
 * - jquery-2xjs
 * - google-maps.api-v3.1.16.js
 *
 * @project Generic
 * @date 2014-08
 * @author Marcel Wagner
 * @licensor SapientNitro
 * @site miscellaneous
 *
 * Plugin to show a google maps map on the page
 *
 * Example (minimum) mark-up:
 * <div class="mapcontainer" id="map_canvas"></div>
 *
 * the data attribute 'data-map-options' is optional it can be used to overwrite map configuration options:
 * container -  defines the context of the object
 * center {google maps object} - defines the center of the map to display differnet mapparts
 * zoom {integer} - defines the zoom of the map. The bigger the number, the more detailed the map part will be.
 * mapTypeId {google.maps.MapTypeId} - Defines how the map should be displayd. This can be changed to roadmap, satellite, hybrid and terrain.
 *
 *
 *
 * grab the sapient nitro (sn) namespace or create one */
if (window.sn === undefined) {
    window.sn = {};
}

(function (window, document, $, sn, google) {

    'use strict';

    sn.maps = {


        /**
         * Default options
         * @type {object}
         * @description
         * container -  defines the context of the object
         * latitude  - the latidude of the center point for the googlemaps object
         * longitude  - the longitude of the center point for the googlemaps object
         * zoom {integer} - defines the zoom of the map. The bigger the number, the more detailed the map part will be.
         * mapTypeId {google.maps.MapTypeId} - Defines how the map should be displayd. This can be changed to roadmap, satellite, hybrid and terrain.
         */
        options : {
            container   :   window,
            latitude : 50.827323,
            longitude: 10.725708,
            zoom: 6,
            mapTypeId: 'roadmap'
        },

        /**
         * Marker options
         * @type {object}
         * @description
         * This is an optional json object to set marker to the map. An example json object can look like follows:
         *{
         *  "markers": [
         *      {
         *          "latitude": 50.827323,
         *          "longitude": 10.725708,
         *          "image": "/resources/assets/icons/320/ico-POI-map.png"
         *      },
         *      {
         *          "latitude": 53.570207,
         *          "longitude": 10.083008,
         *          "image": "/resources/assets/icons/320/ico-POI-map.png"
         *      },
         *      {
         *          "latitude": 53.02193,
         *          "longitude": 8.814087,
         *          "image": "/resources/assets/icons/320/ico-POI-map.png"
         *      }
         *  ]
         *}
         */
        markers : {},




        /**
         * Constructor function for google maps map
         *
         * @see init()
         * @param {jQuery} Element which shall be used for the lazy load
         * @param {object} Optional parameters
         */
        construct : function (element, options) {
            var attributeOptions = element.data('map-options');

            // Read options set on the element's data attribute, if it is set:
            this.options = $.extend({}, this.options, options, (attributeOptions && typeof attributeOptions === 'object') ? attributeOptions : {});

            var attributeMarkers = element.data('map-markers');

            // Read options set on the element's data attribute, if it is set:
            this.markers = $.extend({}, this.markers, (attributeMarkers && typeof attributeMarkers === 'object') ? attributeMarkers : {});

            //get the DOM element container
            this.domElement = element.get(0);
            this.element  = element;

            //Init map for current
            this.init();
            return this;
        },

        /**
         * the showMap function is called when a mapcontainer is found
         *
         * @param {object} The element where the map should be displayed in
         * @description This function creates a new google.maps.Map object with the given options and set it to the mapcontainer.
         * Further more if there are markers defined it will put the markers on the map.
        */
        showMap : function () {
            /**
            * overwrite the mapOptions to set all correct options for the google map. There are a lot more options to customize the map.
            * all possible attributes are documented in the google maps api.
            */
            var mapOptions = {
                zoom: this.options.zoom,
                center: new google.maps.LatLng(this.options.latitude, this.options.longitude),
                mapTypeId: this.options.mapTypeId
            };
            var that = this, map = new google.maps.Map(document.getElementById(this.element.attr("id")), mapOptions);

            $.each(this.markers.markers, function (i, marker) {
                that.setMarker(map, marker.latitude, marker.longitude, marker.image);
            });
        },

        /**
         * the setMarker function is called if markers are defined
         *
         * @param {object} The map where the marker should be displayed
         * @param {integer} The latitude position of the marker
         * @param {integer} The longitude position of the marker
         * @param {string} the path to an optional image which should be used instead of the default google location pin.
         * @description This function creates a latlng object to set the position of the marker. After that it creates a new marker object and put this
         * on the map.
        */
        setMarker : function (map, latitude, longitude, image) {
            // create a new object which imply the position of the marker
            var myLatlng = new google.maps.LatLng(latitude, longitude);
            var marker;

            // create a new object which sets the position of the marker, the map where the marker should be set to and the optional icon which should be displayed.
            marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                icon: image
            });
            return marker;
        },


        /**
         * init function of maps plugin
         */
        init    :   function () {
            var self = this;

            //if the mapInitialized event is triggered, show a googel maps map inside this element.
            $(this.domElement).on("mapInitialized", function (e) {
                self.showMap();
            });

            // trigger the mapInitialized event to make sure that the map is shown.
            self.element.trigger("mapInitialized");
        }

    };

    sn.moduleController.register("maps", sn.maps, '.googlemap');
}(window, document, $, window.sn));