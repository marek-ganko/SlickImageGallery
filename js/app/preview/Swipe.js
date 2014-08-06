'use strict';
var app = ns('app');

/**
 * @class app.preview.Swipe
 */
app.preview.Swipe = (function () {

    /**
     * @constructor
     * @param {jQuery} jQuery
     */
    return function (jQuery) {

        /**
         *  @param {*} scope
         *  @param {HTMLElement} element
         *  @param {Callback} swipeCallback
         *  @param {Callback} cancelCallback
         *  @param {Callback} previousCallback
         *  @param {Callback} nextCallback
         *  @param {Callback} upCallback
         */
        this.init = function (scope, element, swipeCallback, cancelCallback, previousCallback, nextCallback, upCallback) {
            jQuery(element).swipe({
                triggerOnTouchEnd: true,
                swipeStatus: function (event, phase, direction, distance) {
                    if (phase == 'move' && (direction == 'left' || direction == 'right')) {
                        swipeCallback.call(scope, direction, distance);
                    }
                    else if (phase == 'cancel') {
                        cancelCallback.call(scope);
                    }
                },
                swipeLeft: function () {
                    nextCallback.call(scope);
                },
                swipeRight: function () {
                    previousCallback.call(scope);
                },
                swipeUp: function () {
                    upCallback.call(scope);
                }
            });
        };
    };
})();