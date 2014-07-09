"use strict";
var app = ns('app.lazy');

/**
 * @extends app.lazy.Loader
 * @class app.lazy.ContentLoader
 */
app.lazy.ContentLoader = (function() {

    /**
     * @constructor
     */
    return function() {
        var constructor = function() {
            this.threshold = 4000;
            this.delay = 100;

            /**
             * @param {HTMLElement} trackingElement
             * @param {Callback} callback
             */
            this.listen = function(trackingElement, callback) {
                window.addEventListener('resize', this.debounce(this.loadContent.bind(this, trackingElement, callback)), false);
                document.addEventListener('scroll', this.debounce(this.loadContent.bind(this, trackingElement, callback)), false);
                document.addEventListener('touchstart', this.debounce(this.loadContent.bind(this, trackingElement, callback)), false);
                document.addEventListener('touchmove', this.debounce(this.loadContent.bind(this, trackingElement, callback)), false);
                document.addEventListener('touchstop', this.debounce(this.loadContent.bind(this, trackingElement, callback)), false);
            };

            /**
             * @param {HTMLElement} element
             * @param {Callback} callback
             */
            this.load = function(element, callback) {
                this.inViewport(element, this.threshold, callback);
            };
        };

        constructor.prototype = new app.lazy.Loader();
        return new constructor();
    };
})();