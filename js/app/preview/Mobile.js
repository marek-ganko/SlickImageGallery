'use strict';
var app = ns('app.lazyLoader');

/**
 * @class app.preview.Mobile
 * @extends app.preview.Abstract
 */
app.preview.Mobile = (function (window, document) {

    /**
     * @constructor
     * @param {jQuery} jQuery
     * @param {app.preview.Swipe} Swipe
     */
    return function (jQuery, Swipe) {
        var constr = function () {

            /**
             * Initialize preview controls (Swipe handler)
             */
            this.initControls = function () {
                Swipe.init(this, this.itemsContainer, this.swipeCallback, this.cancelCallback, this.previousCallback, this.nextCallback, this.upCallback);
            };

            /**
             * Triggered during swipe
             * @param {String} direction
             * @param {Number} distance
             */
            this.swipeCallback = function (direction, distance) {
                var nextImageContainer = this.currentImageContainer[direction == 'left' ? 'nextSibling' : 'previousSibling'],
                    tranform = 'translate(' + (direction == 'left' ? '-' : '') + distance + 'px, 0)',
                    contentWidth = document.getElementById('content').clientWidth,
                    transformNext = 'translate(' + (((direction == 'left' ? -1 : 1) * distance) + ((direction == 'left' ? 1 : -1) * contentWidth)) + 'px, 0)',
                    transition = 'none';

                this.currentImageContainer.style.transition = transition;
                this.currentImageContainer.style.webkitTransition = transition;
                this.currentImageContainer.style.transform = tranform;
                this.currentImageContainer.style.WebkitTransform = tranform;

                if (nextImageContainer) {
                    nextImageContainer.style.transition = transition;
                    nextImageContainer.style.webkitTransition = transition;
                    nextImageContainer.style.transform = transformNext;
                    nextImageContainer.style.WebkitTransform = transformNext;
                }
            };

            /**
             * Triggered on not full swipe
             */
            this.cancelCallback = function () {
                jQuery('.image').removeAttr('style');
            };

            /**
             * Triggered on swipe right
             */
            this.previousCallback = function () {
                jQuery('.image').removeAttr('style');
                this.showPrevious();
            };

            /**
             * Triggered on swipe left
             */
            this.nextCallback = function () {
                jQuery('.image').removeAttr('style');
                this.showNext();
            };

            /**
             * Triggered on swipe up
             */
            this.upCallback = function () {
                this.hide();
            };

            /**
             * Toggle Listener on Scroll
             * @param {Boolean} on
             */
            this.toggleListenScroll = function (on) {
                if (on) {
                    document.ontouchmove = function () {
                        return true;
                    };
                    document.body.style.overflow = '';
                } else {
                    document.ontouchmove = function (event) {
                        event.preventDefault();
                        return false;
                    };
                    document.body.style.overflow = 'hidden';
                }
            };
        };

        // extend
        constr.prototype = new app.preview.Abstract(window, document);
        var Mobile = new constr();
        Mobile.setScope(Mobile);
        return Mobile;
    };
})(window, document);