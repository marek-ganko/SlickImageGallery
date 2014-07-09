"use strict";
var app = ns('app.lazy');

/**
 * @class app.lazy.ImageLoader
 */
app.lazy.ImageLoader = (function() {

    /**
     * @constructor
     */
    return function() {
        var constructor = function() {
            var _self = this;

            this.threshold = 2000;
            this.delay = 100;

            this.listen = function() {
                window.addEventListener('resize', this.debounce(this.loadThumbnail.bind(this), 10), false);
                document.addEventListener('scroll', this.debounce(this.loadThumbnail.bind(this), 10), false);
                document.addEventListener('touchstart', this.debounce(this.loadThumbnail.bind(this), 10), false);
                document.addEventListener('touchmove', this.debounce(this.loadThumbnail.bind(this), 10), false);
                document.addEventListener('touchstop', this.debounce(this.loadThumbnail.bind(this), 10), false);
            };

            this.load = function() {
                var unwatched = document.querySelectorAll('img[data-thumb]');
                for (var i in unwatched) {
                    if (unwatched[i].parentNode && unwatched[i].parentNode.parentNode) {
                        this.inViewport(unwatched[i].parentNode.parentNode, _self.threshold, function(imageContainer) {
                            var image = imageContainer.firstChild.firstChild;
                            image.onload = function() {
                                imageContainer.setAttribute('class', imageContainer.getAttribute('class').replace('blank', '').trim());
                            };
                            image.onerror = function() {
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

        constructor.prototype = new app.lazy.Loader();
        return new constructor();
    };
})();