"use strict";
var app = ns('app');

/**
 * @class app.Gallery
 */
app.Gallery = (function(){

    /**
     * @constructor
     * @param {app.Image} Image
     * @param {app.stream.Abstract} Stream
     * @param {app.lazy.ImageLoader} ImageLoader
     * @param {app.lazy.ContentLoader} ContentLoader
     */
    return function(Image, Stream, ImageLoader, ContentLoader) {

        this.container = null;
        this.bottomTriggerElement = null;

        this.init = function() {
            var lazyLoaderCalled = false;

            this.createContainer();

            this.getImages(function(err) {
                if (err) {
                    return app.Error.show(err);
                }
                // @TODO - refactor - change naming and reorganize listeners
                if (!lazyLoaderCalled){
                    ImageLoader.listen();
                    lazyLoaderCalled = true;
                }
                ImageLoader.load.call(ImageLoader);
            });
        };

        this.createContainer = function() {
            this.container = document.createElement('div');
            this.container.setAttribute('id', 'Gallery');
            this.bottomTriggerElement = document.createElement('div');
            this.bottomTriggerElement.setAttribute('id', 'bottomTrigger');

            // #Gallery #Images
            this.container.appendChild(Image.container);
            // #Gallery #bottomTrigger
            this.container.appendChild(this.bottomTriggerElement);
            // body #Gallery
            document.body.appendChild(this.container);
        };

        /**
         * @param {Callback} callback
         */
        this.getImages = function(callback) {
            ContentLoader.listen(
                this.bottomTriggerElement,
                function() {
                    Stream.getList(function(error, data) {
                        return error && callback(error) || Image.createList(data, callback)
                    })
                }
            );
        };
    };

})();