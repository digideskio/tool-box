/*jshint browser:true,camelcase:true,curly:true,eqeqeq:true,forin:true,immed:true,jquery:true,latedef:true,maxparams:5,maxdepth:5,noarg:true,noempty:true,nonew:true,undef:true,unused:vars,strict:true */
/**
 * Browser feature detection tests
 *
 * Any scripts that test the current browaer
 * for certain features, APIs or objects should be placed here.
 * This script is loaded within the head to make related class
 * definitions available at render time.
 *
 * Please note, that this is a sensible spot, which is critical
 * for page load and render performance. Therefore make sure, that
 * any test is reasonable to exist within the <head> section and
 * performs as good and fast as possible.
 *
 * @project Generic UI
 * @date 2014
 * @author MSCGN
 * @licensor SapientNitro
 * @site miscellaneous
 */

(function(window,document){

    'use strict';

    // remove no-js class to activate accordant layouts
    document.documentElement.className = document.documentElement.className.replace(/\bno-js\b/,'');

    //Check for Flex Box
    //display: -webkit-box;
    //display: -moz-box;
    //display: -ms-flexbox;
    //display: box;
    var detect = document.createElement("div");
    var arr = ["-webkit-box","-moz-box","-ms-flexbox","box"];
    for (var i = 0;i < arr.length; i++) {
        detect.style.display = arr[i];
        if (detect.style.display === arr[i]) {
            document.documentElement.className = document.documentElement.className.replace(/\bflex-box\b/,'') + " flex-box";
        }
    }

}(window,document));