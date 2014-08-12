/*jshint browser:true,camelcase:true,curly:true,eqeqeq:true,forin:true,immed:true,jquery:true,latedef:true,maxparams:5,maxdepth:5,noarg:true,noempty:true,nonew:true,undef:true,unused:vars,strict:true */
/**
 * SapientNitro jQuery plugin for input-types number
 * masks the native number input behaviour with
 * customized step (counter) elements
 *
 * @dependencies:
 * - jquery.min.js (parent-site)
 * - sn.pointertap.js (parent-site)
 *
 * @project Lufthansa NewUI Booking
 * @date 2012-12
 * @author Niklas Zillinger, Sapient GmbH
 * @licensor Lufthansa
 * @site miscellaneous
 *
 * Example (minimum) mark-up:
 * The tags are negligible, but the hierarchie of the classes
 * and data-attributes is required:
 * <label class="number-input" id="numberInputID" for="inputID">
 *     <a href="#" data-dir="plus">+</a>
 *         <input id="inputID" value="1" type="number" readonly="readonly" max="9" min="1" step="1" data-relation='{DATARELATION_PARARMS}' />
 *     <a href="#" [disabled="disabled" or not] data-dir="minus">-</a>
 * </label>
 *
 * Possible data-relation params are:
 *
 * [addend] {string}
 * the id of another numberInput object, that in sum with the current
 * number value may not exceed a specified max value
 * e. g. num1 + num2 may not be bigger than X
 *
 * [addendMaxSum] {integer}
 * specifies the max value for the as [addend] specified numberInput
 *
 * [dependant] {string}
 * the id of another numberInput object, that is dependent of this
 * numberInput through a specified parameter
 * e. g. the "max" value of the dependant is set due to the
 * current value of this numberInput field
 *
 * [dependantAttr]  {string}
 * specifies the dependent attribute for the as [dependant] specified
 * numberInput
 *
 * Now the expandable could be initialised like this (see end of this file),
 * options don't need to be set, if defaults are used:
 * jQuery('.number-input').numberinput({
 *     minusButtonSelector : "a[data-dir=minus]",
 *     plusButtonSelector  : "a[data-dir=plus]",
 *     inputFieldSelector  : "input[type=number]",
 *     stepAttributeKey    : "step",
 *     minValAttributeKey  : "min",
 *     maxValAttributeKey  : "max",
 *     dataRelationKey     : "relation",
 *     addendIDKey         : "addend",
 *     addendMaxSumKey     : "addendMaxSum",
 *     dependantIDKey      : "dependant",
 *     dependantAttrKey    : "dependantAttr"
 * });
 *
 * [minusButtonSelector] {string}
 * CSS selector for the related minus (decrease) button
 * default: "a[data-dir=minus]"
 *
 * [plusButtonSelector] {string}
 * CSS selector for the related plus (increase) button
 * default: "a[data-dir=plus]"
 *
 * [inputFieldSelector] {string}
 * CSS selector for the related input number field
 * default: "input[type=number]"
 *
 * [stepAttributeKey] {string}
 * attribute name for defining the step size for (de- or
 * increasing the number value)
 * default: "step"
 *
 * [minValAttributeKey] {string}
 * attribute name for defining the min value for the
 * number input field
 * default: "min"
 *
 * [maxValAttributeKey] {string}
 * attribute name for defining the max value for the
 * number input field
 * default: "max"
 *
 * [dataRelationKey] {string}
 * data-attribute key (as data-[KEY]) for passing a JSON
 * with related numberInput / input field parameters
 * default: "relation"
 *
 * [addendIDKey] {string}
 * data-relation object parameter that defines an
 * addend for this numberInput object
 * this numberInput value plus the addend input value
 * may not exceed a specified max sum
 * default: "addend"
 *
 * [addendMaxSumKey] {string}
 * data-relation object parameter that defines an
 * max sum for the [addend] numberInput this numberInput
 * default: "addendMaxSum"
 *
 * [dependantIDKey] {string}
 * data-relation object parameter that defines an
 * dependant for this numberInput object
 * this numberInput value specifies the specified attribute
 * value of the dependant (e. g. max attribute)
 * default: "dependant"
 *
 * [dependantAttrKey] {string}
 * data-relation object parameter that defines the
 * attribute of the [dependant] that is altered by this
 * numberInput value
 * default: "dependantAttr"
 *
 * [numberInputObject] {string}
 * plugin name for the numberInput object, in order to
 * select the JavaScript Object of the numberInput plugin
 * for dependant or addend elements
 * default: "numberinput"
 */

// grab the sapient nitro (sn) namespace or create one
if(typeof window.sn === "undefined"){
    window.sn = {};
}
(function(window, document, $, sn) {

    'use strict';

    sn.numberInput = {

        /**
         * Default values
         *
         * @type {object}
         */
        options : {
            minusButtonSelector : "a[data-dir=minus]",
            plusButtonSelector  : "a[data-dir=plus]",
            inputFieldSelector  : "input[type=number]",
            stepAttributeKey    : "step",
            minValAttributeKey  : "min",
            maxValAttributeKey  : "max",
            dataRelationKey     : "relation",
            addendIDKey         : "addend",
            addendMaxSumKey     : "addendMaxSum",
            dependantIDKey      : "dependant",
            dependantAttrKey    : "dependantAttr",
            numberInputObjKey   : "numberinput"
        },


        /**
         * Constructor function for a single number input
         *
         * @see init()
         * @param {jQuery} Element which shall be used for the expandable
         * @param {object} Optional parameters
         */
        construct : function(element, options) {
            var attributeOptions = element.data('numberinput-options');

            // Read options set on the element's data attribute, if it is set:
            this.options = $.extend({}, this.options, options, (attributeOptions && typeof attributeOptions === 'object') ? attributeOptions : {});

            // Default stuff
            this.options = $.extend({}, this.options, options);
            this.element  = element;
            this.domElement = element.get(0);
            // Filter some elements
            this.minusButton = this.element.find(this.options.minusButtonSelector).first();
            this.plusButton = this.element.find(this.options.plusButtonSelector).first();
            this.numberInput = this.element.find(this.options.inputFieldSelector).first();
            // get the number-input parameters
            this.stepSize = parseInt(this.numberInput.attr(this.options.stepAttributeKey), 10);
            this.minVal = parseInt(this.numberInput.attr(this.options.minValAttributeKey), 10);
            this.maxVal = parseInt(this.numberInput.attr(this.options.maxValAttributeKey), 10);

            this.numberInput.attr("readonly", "readonly");

            // cache the overall max to control dataRelation adjustments of the maxVal
            this.absMaxVal = this.maxVal;

            // set the internal button data-representation
            this.minusButton.attr("disabled","disabled").data("disabled", true);
            this.plusButton.attr("disabled","disabled").data("disabled", true);

            // get the number input value
            this.numberValue = parseInt(this.numberInput.val(), 10);
            this.hasAddend = false;
            this.hasDependant = false;

            // get validation parameters
            this.dataRelation = this.numberInput.data(this.options.dataRelationKey);
            if (this.dataRelation) {
                // get addend => validator-object [addend.val + this.val <= valid max val]
                this.getAddend();

                // get dependant => validator-object [this.val = dependantAttribute.val]
                this.getDependant();
            }

            // Init object
            this.init();
            return this;
        },



        /**
         * get addend function
         *
         * creates an internal object representation
         * for the passed addend in order to execute
         * related validation rules against it
         * returns false if necessary data is missing
         */
        getAddend : function() {
            var self = this,
                addendElement;

            // if there is an addend, we must also have a maxSum or die
            if (this.dataRelation[this.options.addendIDKey] && this.dataRelation[this.options.addendMaxSumKey]) {
                addendElement = $("#" + this.dataRelation[this.options.addendIDKey]);

                // assign the addend numberInput object
                this.addend = addendElement.data(self.options.numberInputObjKey);
                if (this.addend) {
                    this.addend.maxSum = parseInt(this.dataRelation[this.options.addendMaxSumKey], 10);
                    this.hasAddend = true;
                }

                // not initialised yet? - "call us back" ;) ... and use it for any further overruling
                addendElement.on("ready.sn", function () {
                    self.addend = addendElement.data(self.options.numberInputObjKey);
                    self.addend.maxSum = parseInt(self.dataRelation[self.options.addendMaxSumKey], 10);
                    self.hasAddend = true;
                });
            }
        },



        /**
         * get dependant function
         *
         * creates an internal object representation
         * for the passed dependant in order to execute
         * related validation rules against it
         * returns false if necessary data is missing
         */
        getDependant : function() {
            var self = this,
                dependantElement;

            // if there is an dependant, we must have an attribute to modify or die
            if (this.dataRelation[this.options.dependantIDKey] && this.dataRelation[this.options.dependantAttrKey]) {
                dependantElement = $("#" + this.dataRelation[this.options.dependantIDKey]);

                this.dependant = dependantElement.data(self.options.numberInputObjKey);

                // not initialised yet? - "call us back" ;)
                if (this.dependant) {
                    this.dependant.attrKey = this.dataRelation[this.options.dependantAttrKey];
                    this.hasDependant = true;
                }

                 // not initialised yet? - "call us back" ;) ... and use it for any further overruling
                dependantElement.on("ready.sn", function () {
                    self.dependant = dependantElement.data(self.options.numberInputObjKey);
                    self.dependant.attrKey = self.dataRelation[self.options.dependantAttrKey];
                    self.hasDependant = true;
                });
            }
        },



        /**
         * decrease function
         *
         * decreases the number in the input field
         * by the assigned step-size
         */
        decreaseNumber : function() {
            this.numberValue -= this.stepSize;
            this.updateNumberInput();
        },



        /**
         * decrease function
         *
         * decreases the number in the input field
         * by the assigned step-size
         */
        increaseNumber : function() {
            this.numberValue += this.stepSize;
            this.updateNumberInput();
        },



        /**
         * update function
         *
         * updates the input field and the state
         * of the numberInput module including
         * enabling/disabling the button controls
         */
        updateNumberInput : function() {
            // check the max edge cases for the numberInput
            if (this.numberValue >= this.maxVal) {
                this.disableButton(this.plusButton);
                this.numberValue = this.maxVal;
            } else {
                this.enableButton(this.plusButton);
            }

            // check the max edge cases for the numberInput
            if (this.numberValue <= this.minVal) {
                this.disableButton(this.minusButton);
                this.numberValue = this.minVal;
            } else {
                this.enableButton(this.minusButton);
            }

            this.numberInput.val(this.numberValue);

            if (this.dataRelation) {
                this.updateDataRelations();
            }
        },



        /**
         * update function
         *
         * updates the related input fields and buttons of
         * associated numberInputs based on the accordant
         * rulesets and dependencies
         */
        updateDataRelations : function() {
            if (this.hasAddend) {
                this.updateAddend();
            }
            if (this.hasDependant) {
                this.updateDependant();
            }
        },



        /**
         * update function
         *
         * updates the addend number input
         */
        updateAddend : function() {
            var newAddendVal;

            // decrease the addend's max value
            newAddendVal = this.addend.maxSum - this.numberValue;
            // keep the adjusted max val within set constraints
            newAddendVal = Math.min(newAddendVal, this.addend.absMaxVal);
            this.addend.numberInput.attr(this.options.maxValAttributeKey, newAddendVal);

            if (this.addend.numberInput.val() >= newAddendVal) {
                // if new max value hits the limit, disable its plus-button ...
                this.disableButton(this.addend.plusButton);
            } else {
                // .. else make sure it's enabled
                this.enableButton(this.addend.plusButton);
            }
            // update internally cached values of addend
            this.addend.element.trigger("updateInternalCache.sn");
        },



        /**
         * update function
         *
         * updates the dependant number input
         */
        updateDependant : function() {
            var newDependantVal;

            // if we update the max attribute - make sure the current value validates
            if (this.dependant.attrKey === this.options.maxValAttributeKey) {
                // update the dependant's attribute to the new value
                newDependantVal = Math.min(this.numberValue, this.dependant.absMaxVal);
                this.dependant.numberInput.attr(this.dependant.attrKey, newDependantVal);

                if (this.dependant.numberInput.val() >= newDependantVal) {
                    // if current value hits the limit, disable dependant's plus-button ...
                    this.dependant.numberInput.val(newDependantVal);
                    this.disableButton(this.dependant.plusButton);
                } else {
                    // .. else make sure it's enabled
                    this.enableButton(this.dependant.plusButton);
                }
            } else {
                // update the dependant's attribute to the new value
                this.dependant.numberInput.attr(this.dependant.attrKey, this.numberValue);
            }

            // update internally cached values of dependant
            this.dependant.element.trigger("updateInternalCache.sn");
        },



        /**
         * update function
         *
         * updates the data cache of the numberInput
         * for internal processing with the least
         * amount of DOM access
         * triggered upon external modification events
         */
        updateNumberInputCache : function() {
            // get latest values
            this.numberValue = parseInt(this.numberInput.val(), 10);
            this.minVal = parseInt(this.numberInput.attr(this.options.minValAttributeKey), 10);
            this.maxVal = parseInt(this.numberInput.attr(this.options.maxValAttributeKey), 10);
            this.dataRelation = this.numberInput.data(this.options.dataRelationKey);
        },



        /**
         * disable button function
         *
         * disables a passed button control
         *
         * @param {jQuery} button which shall be disabled
         */
        disableButton : function(button) {
            if (!button.data("disabled")) {
                button.attr("disabled","disabled");
                button.data("disabled", true);
            }
        },



        /**
         * enable button function
         *
         * enables a passed button control
         *
         * @param {jQuery} button which shall be enabled
         */
        enableButton : function(button) {
            if (button.data("disabled")) {
                button.removeAttr("disabled");
                button.data("disabled", false);
            }
        },



        /**
         * Init function
         *
         * validates if all required elements are available
         * binds the required actions and handlers
         */
        init : function() {
            var self = this;

            // Cancel if any element is missing
            if (!this.minusButton.length || !this.plusButton.length || !this.numberInput.length) {
                return;
            }

            // set up initial state and values
            this.updateNumberInput();

            // bind the decrease function
            this.minusButton.on("pointertap", function (e) {
                // 'this' refers to the minusButton, 'self' to the numberInput object
                if (!$(this).data("disabled")) {
                    self.decreaseNumber();
                }
                // prevent default
                return false;
            });

            // bind the increase function
            this.plusButton.on("pointertap", function (e) {
                // 'this' refers to the plusButton, 'self' to the numberInput object
                if (!$(this).data("disabled")) {
                    self.increaseNumber();
                }
                // prevent default
                return false;
            });

            // binds listener to external update events - triggered upon external modification
            this.element.on("updateInternalCache.sn", function () {
                self.updateNumberInputCache();
            });

            // updates data-relations on externally triggered events
            this.element.on("updateDataRelations.sn", function () {
                self.updateDataRelations();
                self.updateNumberInput();
            });


            // when a numberinput get's new values assigned, update the internal absolute max value cache
            this.element.on("ready.sn", function () {
                self.absMaxVal = self.maxVal;
            });
        }
    };
    sn.moduleController.register("numberinput", sn.numberInput, ".number-input");

    // Controller
    sn.numberInputs = (function () {
        var init = function(context) {
            var $context = context || $(document);
            var allNumberInputs = $context.find(".number-input");
            //allNumberInputs.numberinput();
            // signal ready state and update Relations
            allNumberInputs.trigger("ready.sn");
            allNumberInputs.trigger("updateDataRelations.sn");
        };
        return {
            init : init
        };
    }());
    sn.moduleController.register("numberinput", sn.numberInputs, ["init"]);
}(window, document, jQuery, sn));