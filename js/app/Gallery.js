"use strict";
var app = ns('app');

/**
 * @class app.Gallery
 */
app.Gallery = (function(){

    /**
     * @constructor
     * @param {app.Image} Image
     * @param {app.stream.Adapter} Stream
     * @param {app.lazy.ImageLoader} ImageLoader
     * @param {app.lazy.ContentLoader} ContentLoader
     * @param {app.Error} Error
     */
    return function(Image, Stream, ImageLoader, ContentLoader, Error) {

        var _self = this;

        this.container = null;
        this.bottomTriggerElement = null;
        this.imagesLimitPerRequest = 100;

        /**
         * @param {Number} limit
         * @returns {app.Gallery}
         */
        this.setImagesLimitPerRequest = function(limit) {
            this.imagesLimitPerRequest = limit;
            return this;
        };

        /**
         * Initialize gallery
         */
        this.init = function() {

            Image.init();
            this.createContainer();

            // request for image urls
            Stream.init(function(error){
                if (error) {
                    return Error.show(error);
                }

                _self.getImages(function(error) {
                    return error && Error.show(error) || ImageLoader.listen().load();
                });
            });
        };

        /**
         * Creates gallery DOM element container
         */
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
         * Gets image list
         * @param {Callback} callback
         */
        this.getImages = function(callback) {
            ContentLoader
                .setElementToTracking(this.bottomTriggerElement)
                .setCallback(function() {
                    Stream.getList(_self.imagesLimitPerRequest, function(error, data) {
                        return error && callback(error) || Image.createList(data, callback)
                    })
                })
                .listen()
                .load();
        };
    };
})();