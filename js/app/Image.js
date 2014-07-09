"use strict";
var app = ns('app');

/**
 * @class app.Image
 */
app.Image = (function(){

    /**
     * @constructor
     * @param {app.ImagePreview} ImagePreview
     */
    return function(ImagePreview) {

        this.container = null;
        this.list = [];

        this.init = function() {
            this.createContainer();
        };

        this.createContainer = function() {
            this.container = document.createElement('div');
            this.container.setAttribute('id', 'Images');
            // #Images #Preview
            this.container.appendChild(ImagePreview.container);
        };

        this.createList = function(images, done) {
            for (var i in images) {
                // #Images .imgContainer
                this.container.appendChild(this.create(images[i]));
            }
            done();
        };

        this.create = function(image) {
            var imageContainer = document.createElement('div'),
                link = document.createElement('a'),
                imageElement = new Image(),
                size = image.width + ' x ' + image.height + ' (' + this.bytesToSize(image.size) + ')';

            imageContainer.setAttribute('class', 'imgContainer blank');

            link.setAttribute('href', image.src);
            link.setAttribute('title', image.name + ' - ' + size);

            imageElement.setAttribute('data-thumb', image.thumb);
            imageElement.setAttribute('data-url', image.url);
            imageElement.setAttribute('data-src', image.src);
            imageElement.setAttribute('data-size', size);

            imageElement.setAttribute('alt', image.name);

            this.list.push(imageElement);

            link.onclick = function(e) {
                e.preventDefault();
                ImagePreview.show.call(ImagePreview, imageElement);
            };

            // a img
            link.appendChild(imageElement);
            // .imgContainer a
            imageContainer.appendChild(link);
            return imageContainer;
        };

        this.bytesToSize = function(bytes) {
            if (bytes == 0) {
                return '0 Byte';
            }
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
                i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        };
    };
})();