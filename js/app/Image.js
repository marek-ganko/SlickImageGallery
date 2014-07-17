'use strict';
var app = ns('app');

/**
 * @class app.Image
 */
app.Image = (function (document) {

    /**
     * @constructor
     * @param {app.ImagePreview} ImagePreview
     */
    return function (ImagePreview) {

        this.container = null;
        this.list = [];

        /**
         * Initialize Image object
         */
        this.init = function () {
            ImagePreview.init();
            this.createContainer();
        };

        /**
         * Creates DOM element container for images
         */
        this.createContainer = function () {
            this.container = document.createElement('div');
            this.container.setAttribute('id', 'Images');
            // #Images #Preview
            this.container.appendChild(ImagePreview.container);
        };

        /**
         * Creates images objects and appends them to DOM
         * @param {Array} images
         * @param {Callback} callback
         */
        this.createList = function (images, callback) {
            for (var i in images) {
                // #Images .imgContainer
                this.container.appendChild(this.create(images[i]));
            }
            callback(null);
        };

        /**
         * Returns DOM element containing container and image
         * @param {Object} image
         * @returns {HTMLElement}
         */
        this.create = function (image) {
            var imageContainer = document.createElement('div'),
                link = document.createElement('a'),
                imageElement = new Image(),
                size = image.width + ' x ' + image.height + ' (' + app.bytesToSize(image.size) + ')';

            imageContainer.setAttribute('class', 'imgContainer blank');

            link.setAttribute('href', image.src);
            link.setAttribute('title', image.name + ' - ' + size);

            imageElement.setAttribute('data-thumb', image.thumb);
            imageElement.setAttribute('data-url', image.url);
            imageElement.setAttribute('data-src', image.src);
            imageElement.setAttribute('data-size', size);

            imageElement.setAttribute('alt', image.name);

            this.list.push(imageElement);

            link.onclick = function (event) {
                event.preventDefault();
                ImagePreview.show.call(ImagePreview, imageElement);
            };

            // a img
            link.appendChild(imageElement);
            // .imgContainer a
            imageContainer.appendChild(link);
            return imageContainer;
        };
    };
})(document);