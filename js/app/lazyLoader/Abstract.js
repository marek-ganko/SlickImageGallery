'use strict';
var app = ns('app.lazyLoader');

/**
 * @class app.lazyLoader.Abstract
 */
app.lazyLoader.Abstract = function () {

    var _self = this;

    this.threshold = 0;
    this.delay = 100;
    this.isListening = false;

    /**
     * Implementation of listeners
     */
    this.listen = function () {
        throw new Error('Method listen not implemented');
    };

    /**
     * Implementation of load
     */
    this.load = function () {
        throw new Error('Method load not implemented');
    };

    /**
     * Reduce function call by delay
     * @param {Function} fn
     * @returns {Function}
     */
    this.debounce = function (fn) {
        var timer = null;
        return function () {
            var self = this,
                args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(self, args);
            }, _self.delay);
        };
    };

    /**
     * Checks if element is in viewport
     * @param {HTMLElement} element
     * @param {Callback} callback
     * @returns {boolean|*}
     */
    this.inViewport = function (element, callback) {
        var elementTop = element.getBoundingClientRect().top,
            screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
            viewportTop = Math.abs(document.documentElement.getBoundingClientRect().top);

        return elementTop + viewportTop > screenHeight + viewportTop + this.threshold || callback(null, element);
    };
};