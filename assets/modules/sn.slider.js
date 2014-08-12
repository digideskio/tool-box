/*jslint forin: true, sloppy: true, unparam: true, vars: true, white: true */
/*global document, jQuery, log, sn, lh, window */
/**
 * SapientNitro jQuery plugin for slider
 *
 * @dependencies:
 * - jquery-2x.min.js
 * - sn.moduleController.js
 * - sn.yapointer.js
 * - sn.pointerType.js
 *
 * @project Generic
 * @date 2013
 * @author Holger Hellinger, Sapient GmbH
 * @site miscellaneous
 *
 * Slider JS Supports Sliding standard conform with transforms, additional
 *
 *
 * Overwriting of Options at runtime
 * $("#slider").data("slideroptions").options.autoSlide = false;
 *
 * You need a "sn-slider-animate" defined with your transformation
 * .sn-slider-animate {
 *  transition: all 0.3s ease-out 0s;
 * }
 *
 *
 *
 *
 * Example (minimum) mark-up:
 * The tags are negligible, but the hierarchie of the classes
 * are required
 * data-attributes are optionmal:
 * <div class="sn-slider" id="slider" data-slideroptions='{"id":"slider"}'>
 *   <div class="holder">
 *      <div class="slide-wrapper">
 *          Some text 1
 *      </div>
 *      <div class="slide-wrapper">
 *          Some text 2
 *      </div>
 *      <div class="slide-wrapper">
 *          <p>Some text 3</p>
 *      </div>
 *  </div>
 * <!-- Optional arrows -->
 *    <div class="sn-slider-arrowcontainer">
 *       <a class="sn-slider-arrow on" data-dir="-1" href="#"></a>
 *       <a class="sn-slider-arrow" data-dir="1" href="#"></a>
 *      </div>
 * </div>
 *
 *
 * Arrows are just example markup. You can use what ever you want.
 *
 * REV 20140211 - CHanged global event from the container to the elements
 * REV 20140331 - add "sliderInitialized" trigger at the end of init()
 *              - add 180ms timeout on setInitialPositions call after orientation change because of timing issue on Android devices < 4.2
 *
 */

/* grab the sapient nitro (sn) namespace or create one */
if(typeof window.sn === "undefined"){
    window.sn = {};
}
(function(window, document, $, sn) {

    'use strict';

    sn.slider = {

        /**
         * Default values
         *
         * @type {object}
         */
        options : {
            id: "slider",
            slider: ".sn-slider",
            slideElements: 0, /* Will be set in init */
            adjustedElements: 0, /* Will be set in init */
            holder: ".holder", /* Must be a class */
            slideElem: ".slide-wrapper", /* Must be a class */
            arrowContainer: "sn-slider-arrowcontainer", /* Must be a class */
            arrowElement: "sn-slider-arrow", /* Must be a class */
            slideStatusDotContainer: "div", /* Container for dots */
            slideStatusDotContainerClass: "sn-slider-dotcontainer", /* Must be a class */
            slideStatusDots: "a", /* dots element */
            slideStatusDotsClass: "sn-slider-dot", /* Must be a class */
            activeStatusClass: "on", /* Must be a class */
            passiveStatusClass: "off", /* Must be a class */
            sliderAnimateClass: "sn-slider-animate", /* Must be a class */
            showStatusDots : true,  /* Show a list of anchors that allows indicating where the slider is */
            minScrollLength : 10, /* Where does we start scrolling */
            autoSlide : true,  /* Shows next Element in a random manner */
            autoSlideTimeout : 3000,  /* ms to autoslide */
            infiniteLoop : true,  /* Slide must run infiite, not start / swap to the beginning actually not implemented */
            useCSSPosition: false, /* Set this to true to use the CSS position/left property instead of transform/translate3d */
            restartAutoSlide: true, /* Set this to true restart autoslide is overrules by autoslide will not restart when autoSlide is false */
            restartAutoSlideTimeout: 10*1000 /* delay to restart autoslide */
        },


        /**
         * Constructor function for a single slider
         *
         * @see init()
         * @param {jQuery} Element which shall be used for the slider
         * @param {object} Optional parameters
         */
        construct : function(element, options) {
            var attributeOptions = element.data('slideroptions');

            /* Read options set on the element's data attribute, if it is set: */
            this.options = $.extend({}, this.options, options, (attributeOptions && typeof attributeOptions === 'object') ? attributeOptions : {});

            this.element  = element;
            this.slideElement = this.element.find(this.options.slideElem);
            this.holder = this.element.find(this.options.holder).first();
            this.sliderContainer = this.element;


            /* Init object */
            this.init();
            return this;
        },



        /**
         * Init function
         *
         * Filters header & body element. determines the body height for
         * smooth animations.
         * Binds the events for toggle (tap) and orientation changes in
         * order to keep sliders stable in different contexts.
         */
        init : function() {
            var self = this;

            self.index = 0;

            self.slideElements = self.slideElement.length;
            self.adjustedElements = self.slideElements;


            if (self.options.useCSSPosition) {
                self.holder.css('position', 'absolute');
            }

            /* add one element to the end and front to allow an infinite loop */
            if (self.options.infiniteLoop === true) {
                /* Set infinite Count */
                self.adjustedElements = self.slideElements + 2;
                /* clone first and last */
                self.slideElement.eq(0).clone(true).appendTo(self.holder);
                self.slideElement.eq(self.slideElements-1).clone(true).prependTo(self.holder);
                /* If there are arrows switch both on */
                self.sliderContainer.find("." + self.options.arrowElement).removeClass(self.options.passiveStatusClass).addClass(self.options.activeStatusClass);
            } else {
                self.sliderContainer.find("." + self.options.arrowElement).eq(1).removeClass(self.options.passiveStatusClass).addClass(self.options.activeStatusClass);
            }

            self.setInitialPositions();

            self.slideElement.on("pointertap", function(e) {
                $(this).trigger("slideElementClicked");
            });

            self.sliderContainer.on("click", "." + self.options.arrowElement + "." + self.options.activeStatusClass, function(e) {
                e.preventDefault();
                self.stopAutoSlide();
                self.arrowClick(e);
            });

            /* Define these as global variables so we can use them across the entire script.*/
            self.touchstartx = undefined;
            self.touchstarty = undefined;
            self.touchendx = undefined;
            self.touchendy = undefined;
            self.touchmovex = undefined;
            self.touchmovey = undefined;
            self.movex = undefined;
            self.movey = undefined;
            self.longTouch = undefined;
            self.touchMoveStarted = false;
            self.isScrolling = false;
            self.timeout = undefined;

            self.holder.on("pointerdown", function(event) {
                /* If status dots are there, and mouse, don't use buggy mousescrolling */
                if (self.options.showStatusDots === true && event.type === "mousedown") {
                    return;
                }
                self.start(event);
            });

            self.holder.on("pointermove", function(event) {
                /* If status dots are there, and mouse, don't use buggy mousescrolling */
                if (self.options.showStatusDots === true && event.type === "mousemove") {
                    return;
                }
                self.move(event);
            });

            self.holder.on("pointerup pointercancel", function(event) {
                /* If status dots are there, and mouse, don't use buggy mousescrolling */
                if (self.options.showStatusDots === true && (event.type === "mouseup" || event.type === "mouseout")) {
                    return;
                }
                self.end(event);
            });

            self.holder.on("transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd", function(event) {
                self.holder.trigger("sliderTransitionEnd");
            });

            self.holder.on("sliderTransitionEnd", function(event) {
                self.checkSliderEndPosition();
            });

            $(window).on("orientationchange.sn", function () {
                window.setTimeout(function() { self.setInitialPositions(); }, 180);
            });

            if (self.options.showStatusDots === true) {

                self.showStatusDots(self.slideElements);

                self.sliderContainer.find("." + self.options.slideStatusDotContainerClass).on("click", "." + self.options.slideStatusDotsClass, function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.stopAutoSlide();
                    self.moveSlider(e);
                });
            }

            if (self.options.autoSlide === true) {
                self.startAutoSlide();
            }

            self.slideElement.removeClass(self.options.activeStatusClass).eq(0).addClass(self.options.activeStatusClass);

            self.element.trigger("sliderInitialized");
        },

        /**
         * The start event when user clicks/taps on the slider
         *
         * @param {event} e The jQuery click/tap event object
         */
        start : function(e) {
            var self = this;
            self.stopAutoSlide();
            self.touchMoveStarted = true;

            self.longTouch = false;
            window.setTimeout(function() {
              /* Catch Long touchs */
              self.longTouch = true;
            }, 250);

            /* Get the original touch position. */
            self.touchstartx =  e.normalized.clientX;
            self.touchstarty =  e.normalized.clientY;

            self.holder.removeClass(self.options.sliderAnimateClass);
            self.holder.trigger("sliderTouchStart");
        },

        /**
         * The movw event when user clicks/taps on the slider
         *
         * @param {event} e The jQuery click/tap event object
         */
        move : function(e) {
            var self = this,
                index;
            /* Continuously return touch position. */
            self.touchmovex =  e.normalized.clientX;
            self.touchmovey =  e.normalized.clientY;

            /* Calculate distance to translate holder. */
            index = self.getCorrectedInfiniteIndex();
            self.movex = index * self.slideWidth + (self.touchstartx - self.touchmovex);
            /* Only scroll when vertical moving */
            if (Math.abs(self.touchstartx - self.touchmovex) > Math.abs(self.touchstarty - self.touchmovey)) {
                e.preventDefault();
                self.isScrolling = false;
                /* Makes the holder stop moving when there is no more content. */
                /* as long as index in range move */
                if (self.movex > self.getCorrectedBounderyIndex().startIndex * self.slideWidth || self.movex < self.getCorrectedBounderyIndex().endIndex * self.slideWidth) {
                    self.setTranslation(self.movex);
                }
            } else {
                self.isScrolling = true;
            }
            self.holder.trigger("sliderMove");
        },

        /**
         * The end event when user clicks/taps on the slider
         *
         * @param {event} e The jQuery click/tap event object
         */
        end : function(e) {
            var absMove = 0,
                self = this,
                index = 0,
                diff,
                dir;
            self.touchMoveStarted = false;
            self.touchendx =  e.normalized.clientX;
            diff = self.touchendx - self.touchstartx;
            dir = diff < 0 ? -1 : 1;
            /* Do not scroll if movement too small */
            if (Math.abs(diff) < self.options.minScrollLength) {
                return;
            }
            if (self.isScrolling === false) {

                /* Calculate the distance swiped. */
                index = self.getCorrectedInfiniteIndex();
                absMove = Math.abs(index * self.slideWidth - self.movex);
                /* correct the startindex for infinite loop */

                /* Calculate the index. All other calculations are based on the index. */
                if (absMove > self.slideWidth / 2 || self.longTouch === false) {
                    if (dir === 1) {
                        if (self.index > self.getCorrectedBounderyIndex().startIndex) {
                            self.index = self.index - 1;
                        }
                    } else {
                        if (self.index < self.getCorrectedBounderyIndex().endIndex) {
                            self.index = self.index + 1;
                        }
                    }
                }
                /* Move and animate the elements. */
                self.translateHolder(true);

                if (self.options.showStatusDots === true) {
                    self.highLightDot();
                }
            }
        },

        /**
         * getCorrectedInfiniteIndex
         *
         */
        getCorrectedInfiniteIndex : function() {
            var index = 0,
                self = this;
            index = self.options.infiniteLoop ? self.index + 1 : self.index;
            return index;
        },

        /**
         * getCorrectedBounderyIndex
         *
         */
        getCorrectedBounderyIndex : function() {
            var obj = {},
                self = this;
            obj.endIndex = self.options.infiniteLoop ? self.slideElements : self.slideElements - 1;
            obj.startIndex = self.options.infiniteLoop ? -1 : 0;
            return obj;
        },

        /**
         * translateHolder
         *
         * @param {boolean} addClass
         */
        translateHolder : function(addClass) {
            var self = this,
                /* if infinite the initital pos is one left */
                newTranslatePos = self.options.infiniteLoop ? self.index * self.slideWidth + self.slideWidth : self.index * self.slideWidth;
            self.holder.removeClass(self.options.sliderAnimateClass);
            if (addClass === true) {
                self.holder.addClass(self.options.sliderAnimateClass);
            }
            self.setTranslation(newTranslatePos);
            self.slideElement.removeClass(self.options.activeStatusClass).eq(self.index).addClass(self.options.activeStatusClass);
        },

        /**
         * move slider after click
         *
         * @param {obj} e event
         */
        arrowClick : function(e) {
            var self = this,
                me = $(e.target),
                dir = parseInt(me.data("dir"), 10);
            self.index = self.index + dir;
            if (self.options.infiniteLoop === false) {
                me.parent().find("." + self.options.arrowElement).addClass(self.options.activeStatusClass).removeClass(self.options.passiveStatusClass);
                if ((dir === -1 && self.index <= self.getCorrectedBounderyIndex().startIndex) || (dir === 1 && self.index >= self.getCorrectedBounderyIndex().endIndex)) {
                    me.removeClass(self.options.activeStatusClass).addClass(self.options.passiveStatusClass);
                }
            }

            self.holder.removeClass(self.options.sliderAnimateClass);
            self.highLightDot();

            self.translateHolder(true);
        },

        /**
         * move slider after click
         *
         * @param {obj} e event
         */
        moveSlider : function(e) {
            var self = this,
                me = $(e.target),
                parent = me.closest("." + self.options.slideStatusDotContainerClass),
                dots = parent.find("." + self.options.slideStatusDotsClass);

            self.holder.removeClass(self.options.sliderAnimateClass);

            dots.removeClass(self.options.activeStatusClass);
            me.addClass(self.options.activeStatusClass);
            self.index = dots.index(parent.find("." + self.options.activeStatusClass));

            self.translateHolder(true);
        },

        /**
         * reStartAutoSlide slider
         */
        reStartAutoSlide : function() {
            var self = this;
            if (self.options.restartAutoSlide) {
                self.timeout = window.setTimeout(function() {
                   self.setAutoSlideTimeout();
                }, self.options.restartAutoSlideTimeout);
            }
        },

        /**
         * startAutoSlide slider
         */
        startAutoSlide : function() {
            this.setAutoSlideTimeout();
        },

        /**
         * stopAutoSlide slider
         */
        stopAutoSlide : function() {
            var self = this;
            window.clearTimeout(self.timeout);
            self.reStartAutoSlide();
        },

        /**
         * setAutoSlideTimeout slider
         */
        setAutoSlideTimeout : function() {
            var self = this,
                endIndex = 0;
            if (self.options.restartAutoSlide) {
                self.timeout = window.setTimeout(
                    function() {
                        self.index = self.index + 1;
                        /* Autoslide endindex is +1 as of added endElem */
                        endIndex = self.options.infiniteLoop ? self.slideElements : self.slideElements - 1;
                        if (self.index > endIndex) {
                            self.index = 0;
                        }
                        self.translateHolder(true);
                        self.highLightDot();
                        self.startAutoSlide();
                    }, self.options.autoSlideTimeout);
            }
        },

        /**
         * highlight dot
         */
        highLightDot : function() {
            var dots = this.sliderContainer.find("." + this.options.slideStatusDotsClass),
                /* If infinite index is fixed */
                dotIndex = this.index >= this.slideElements ? this.index - 1 : this.index;
            dots.removeClass(this.options.activeStatusClass);
            dots.eq(dotIndex).addClass(this.options.activeStatusClass);
        },

        /**
         * combined transition handler
         *
         * @param {int} newTransformX the x for the transition
         */
        setTranslation : function(newTransformX) {

            /* multiply by -1 to make sure to transform correct */
            newTransformX = newTransformX * -1;

            if (this.options.useCSSPosition) {
                this.holder.css('left', newTransformX + 'px');
                return;
            }
            this.holder.css({
                "transform" : "translate3d(" + newTransformX + "px, 0 , 0)",
                "-o-transform" : "translate3d(" + newTransformX + "px, 0 , 0)",
                "-moz-transform" : "translate3d(" + newTransformX + "px, 0 , 0)",
                "-webkit-transform" : "translate3d(" + newTransformX + "px, 0 , 0)"
            });
        },

        /**
         * Fix width settings on resize
         */
        setInitialPositions : function() {
            var self = this;
            self.slideWidth = parseInt(self.sliderContainer.width(), 10);
            self.translateHolder(false);
            /* JS Available, so set fixed sizes */
            self.holder.find(self.options.slideElem).css({
                "width" : self.slideWidth + "px"
            });
            self.holder.css({
                "width" : (self.slideWidth * self.adjustedElements) + "px",
                "overflow-y": "hidden"
            });
        },

        /**
         * reset the Slider to start or end position if last or first
         * with infinite loop
         */
        checkSliderEndPosition : function() {
            var self = this,
                tmp = self.index;
            /* Check the end index, after sliding. */
            if (self.options.infiniteLoop === true) {
                if (self.index < 0) {
                    self.index = self.slideElements - 1;
                } else if (self.index > self.slideElements - 1) {
                     self.index = 0;
                }
                /* if index has changed set new position without animation */
                if (tmp !== self.index) {
                    self.highLightDot();
                    self.translateHolder(false);
                }
            }
        },

        /**
         * Shows Status Pointers if options set
         *
         * @param {int} count # of statusPointers
         */
        showStatusDots : function(count) {
            var i = 0,
                dotsContainer = $(document.createElement(this.options.slideStatusDotContainer)).addClass(this.options.slideStatusDotContainerClass),
                dotElement = $(document.createElement(this.options.slideStatusDots)).addClass(this.options.slideStatusDotsClass).attr("href", "#"),
                temp;

            for (i = 0; i < count; i = i + 1) {
                temp = dotElement.clone();
                if (i === 0) {
                    temp.addClass(this.options.activeStatusClass);
                }
                dotsContainer.append(temp);
            }

            this.sliderContainer.append(dotsContainer);
        }
    };
    sn.moduleController.register("slider", sn.slider, ".sn-slider");
}(window, document, jQuery, sn));