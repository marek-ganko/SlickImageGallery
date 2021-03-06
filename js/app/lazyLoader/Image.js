'use strict';
var app = ns('app.lazyLoader');

/**
 * @class app.lazyLoader.Image
 * @extends app.lazyLoader.Abstract
 */
app.lazyLoader.Image = (function (window, document) {

    /**
     * @constructor
     */
    return function () {
        var constr = function () {
            this.threshold = 2000;
            this.delay = 100;

            /**
             * Adds listeners on scroll and resize actions
             * @returns {app.lazyLoader.Image}
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
             * Loads Images with data-thumb attribute
             */
            this.load = function () {
                var unwatched = document.querySelectorAll('img[data-thumb]');
                for (var i in unwatched) {
                    if (unwatched[i].parentNode && unwatched[i].parentNode.parentNode) {
                        this.inViewport(unwatched[i].parentNode.parentNode, function (error, imageContainer) {
                            var image = imageContainer.firstChild.firstChild;
                            image.onload = function () {
                                imageContainer.setAttribute('class', imageContainer.getAttribute('class').replace('blank', '').trim());
                            };
                            image.onerror = function () {
                                // remove broken image
                                imageContainer.parentNode.removeChild(imageContainer);
                            };
                            image.setAttribute('src', image.getAttribute('data-thumb'));
                            image.removeAttribute('data-thumb');
                        });
                    }
                }
            };
        };

        // extend
        constr.prototype = new app.lazyLoader.Abstract();
        return new constr();
    };
})(window, document);