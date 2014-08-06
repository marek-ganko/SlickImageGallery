'use strict';
var app = ns('app.lazyLoader');

/**
 * @class app.lazyLoader.Content
 * @extends app.lazyLoader.Abstract
 */
app.lazyLoader.Content = (function (window, document) {

    /**
     * @constructor
     */
    return function () {
        var constr = function () {
            this.threshold = 4000;
            this.delay = 100;
            this.trackingElement = null;
            this.callback = null;

            /**
             * Sets tracking DOM element for load action
             * @param {HTMLElement} element
             * @returns {app.lazyLoader.Content}
             */
            this.setElementToTracking = function (element) {
                this.trackingElement = element;
                return this;
            };

            /**
             * Sets callback for load action
             * @param {Callback} callback
             * @returns {app.lazyLoader.Content}
             */
            this.setCallback = function (callback) {
                this.callback = callback;
                return this;
            };

            /**
             * Adds listeners on scroll and resize actions
             * @returns {app.lazyLoader.Content}
             */
            this.listen = function () {
                if (!this.isListening) {
                    window.addEventListener('resize', this.debounce(this.load.bind(this)), false);
                    document.addEventListener('scroll', this.debounce(this.load.bind(this)), false);
                    document.addEventListener('touchstart', this.debounce(this.load.bind(this)), false);
                    document.addEventListener('touchmove', this.debounce(this.load.bind(this)), false);
                    document.addEventListener('touchstop', this.debounce(this.load.bind(this)), false);
                    this.isListening = true;
                }
                return this;
            };

            /**
             * Loads image list
             */
            this.load = function () {
                this.inViewport(this.trackingElement, this.callback);
            };
        };

        // extend
        constr.prototype = new app.lazyLoader.Abstract();
        return new constr();
    };
})(window, document);