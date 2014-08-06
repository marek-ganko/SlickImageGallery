'use strict';
var app = ns('app.preview');

/**
 * @class app.preview.Abstract
 */
app.preview.Abstract = function (window, document) {

    var _self = this;

    this.container = null;
    this.itemsContainer = null;
    this.boundingImages = 2;
    this.currentThumbnail = null;
    this.currentImageContainer = null;

    /**
     * Initialize preview
     * @param {HTMLElement} contaner
     */
    this.init = function (container) {
        this.createContainer();
        container.appendChild(this.container);
        this.initControls();
    };

    this.setScope = function (scope) {
        _self = scope;
    };

    /**
     * listeners for preview control
     * @param {EventTarget} event
     */
    this.listeners = function (event) {
        // close on ESC
        if (event.keyCode == 27) {
            _self.hide();
        }
        // show previous picture on left and A
        if (event.keyCode == 37 || event.keyCode == 65) {
            _self.showPrevious();
        }
        // show next picture on right and D
        if (event.keyCode == 39 || event.keyCode == 68) {
            _self.showNext();
        }
    };

    /**
     * Adds liteners
     */
    this.startListening = function () {
        window.addEventListener('keyup', this.listeners, false);
    };

    /**
     * Removes listeners
     */
    this.stopListening = function () {
        window.removeEventListener('keyup', this.listeners, false);
    };

    /**
     * Creates prieview DOM container
     */
    this.createContainer = function () {
        var close = document.createElement('a'),
            content = document.createElement('div');

        this.container = document.createElement('div');
        this.container.setAttribute('id', 'Preview');

        close.setAttribute('id', 'close');
        close.setAttribute('href', '#');
        close.onclick = function (event) {
            event.preventDefault();
            _self.hide();
        };
        this.container.appendChild(close);

        this.itemsContainer = document.createElement('div');
        this.itemsContainer.setAttribute('id', 'previewItems');
        content.setAttribute('id', 'content');
        content.appendChild(this.itemsContainer);
        this.container.appendChild(content);
    };

    /**
     * Creates preview DOM elements
     * @param {HTMLElement} thumbnail
     * @param {String} imageClass - previous, current, next
     * @returns {HTMLElement}
     */
    this.createImageContainer = function (thumbnail, imageClass) {
        var sourceLink = document.createElement('a'),
            imageElement = new Image(),
            imageContainer = document.createElement('div'),
            caption = document.createElement('div');

        sourceLink.setAttribute('href', thumbnail.getAttribute('data-url'));
        sourceLink.setAttribute('target', '_blank');
        sourceLink.appendChild(document.createTextNode('source image'));

        caption.setAttribute('class', 'caption');
        caption.innerHTML = thumbnail.getAttribute('data-size') + '<br>';
        caption.appendChild(sourceLink);

        app.addClass(imageContainer, 'image');
        app.addClass(imageContainer, 'blank');
        app.addClass(imageContainer, imageClass);

        imageElement.onload = function () {
            app.removeClass(imageContainer, 'blank');
        };
        imageElement.onerror = function () {
            app.removeClass(imageContainer, 'blank');
            app.addClass(imageContainer, 'broken');
        };
        imageElement.setAttribute('src', thumbnail.getAttribute('data-src'));

        imageContainer.appendChild(imageElement);
        imageContainer.appendChild(caption);

        return imageContainer;
    };

    /**
     * Get Images from Gallery image list
     * @param {String} direction
     * @param {Number} limit
     * @param {Number} offset
     * @param {Callback} callback
     */
    this.getImages = function (direction, limit, offset, callback) {
        var slibling = direction == 'next' ? 'nextSibling' : 'previousSibling',
            thumbnailListContainer = this.getCurrentThumbnail().parentNode.parentNode,
            i = 0,
            limitRange = limit + offset;

        while (i < limitRange && thumbnailListContainer) {
            ++i;

            thumbnailListContainer = thumbnailListContainer[slibling];

            if (i - 1 < offset || !(thumbnailListContainer && thumbnailListContainer.getAttribute('class') == 'imgContainer')) {
                continue;
            }

            if (thumbnailListContainer.nodeType == 1) {
                if (direction == 'next') {
                    this.itemsContainer.appendChild(this.createImageContainer(thumbnailListContainer.firstChild.firstChild, direction));
                } else {
                    this.itemsContainer.insertBefore(this.createImageContainer(thumbnailListContainer.firstChild.firstChild, direction), this.itemsContainer.firstChild);
                }
            }
        }
        return typeof callback === 'function' && callback(null, this.currentImageContainer);
    };

    /**
     * Hide preview
     */
    this.hide = function () {
        this.container.style.display = 'none';
        this.toggleListenScroll(true);
        this.stopListening();
    };

    /**
     * Show preview
     * @param {HTMLElement} image
     */
    this.show = function (image) {

        // clear all previous content
        this.itemsContainer.innerHTML = '';
        this.container.style.display = 'block';

        this.toggleListenScroll(false);

        this.currentImageContainer = this.createImageContainer(image, 'current');
        this.setCurrentThumbnail(image);
        this.itemsContainer.appendChild(this.currentImageContainer);
        this.startListening();
        this.getImages('next', this.boundingImages, 0);
        this.getImages('previous', this.boundingImages, 0);
    };

    /**
     * Show next image
     */
    this.showNext = function () {
        var thumbnailContainer = this.getCurrentThumbnail().parentNode.parentNode;

        this.setCurrentThumbnail(thumbnailContainer.nextSibling.firstChild.firstChild);

        this.getImages('next', 1, this.boundingImages - 1, function (error, currentImageContainer) {
            if (error) {
                return error;
            }

            _self.setCurrentImageContainer(currentImageContainer, currentImageContainer.nextSibling, 'next');
            _self.backgroundScrollToCurrentThumbnail();

            if (document.querySelectorAll('.previous').length > _self.boundingImages) {
                _self.removeFirstImageContainer();
            }
        });
    };

    /**
     * Show previous image
     */
    this.showPrevious = function () {
        var thumbnailContainer = this.getCurrentThumbnail().parentNode.parentNode;

        if (!this.isFirstThumbnailContainer(thumbnailContainer)) {

            this.setCurrentThumbnail(thumbnailContainer.previousSibling.firstChild.firstChild);

            this.getImages('previous', 1, this.boundingImages - 1, function (error, currentImageContainer) {
                if (error) {
                    return error;
                }

                _self.setCurrentImageContainer(currentImageContainer, currentImageContainer.previousSibling, 'previous');
                _self.backgroundScrollToCurrentThumbnail();

                if (document.querySelectorAll('.next').length > _self.boundingImages) {
                    _self.removeLastImageContainer();
                }
            });
        }
    };

    /**
     * Check if given thumbnail container is first on the list
     * @param {HTMLElement} thumbnailContainer
     * @returns {boolean}
     */
    this.isFirstThumbnailContainer = function (thumbnailContainer) {
        return thumbnailContainer.previousSibling.getAttribute('class') != 'imgContainer';
    };

    /**
     * Set current image from the list visible on preview
     * @param {HTMLElement} thumbnail
     */
    this.setCurrentThumbnail = function (thumbnail) {
        this.currentThumbnail = thumbnail;
    };

    /**
     * @returns {null|*}
     */
    this.getCurrentThumbnail = function () {
        return this.currentThumbnail;
    };

    /**
     * Set current preview image
     * @param {HTMLElement} currentImageContainer
     * @param {HTMLElement} imageContainer
     * @param {String} direction
     */
    this.setCurrentImageContainer = function (currentImageContainer, nextImageContainer, direction) {
        app.removeClass(currentImageContainer, 'current');
        app.addClass(currentImageContainer, (direction == 'next' ? 'previous' : 'next'));
        this.currentImageContainer = nextImageContainer;
        app.removeClass(nextImageContainer, 'next');
        app.removeClass(nextImageContainer, 'previous');
        app.addClass(nextImageContainer, 'current');
    };

    /**
     * Scroll window to passed thumbnail top
     */
    this.backgroundScrollToCurrentThumbnail = function () {

        var viewport = document.documentElement.getBoundingClientRect(),
            thumbnailOffset = this.getCurrentThumbnail().parentNode.parentNode.getBoundingClientRect(),
            vieportTop = Math.abs(viewport.top);

        window.scrollTo(0, thumbnailOffset.top + vieportTop);
    };

    /**
     * Remove first image with its container
     */
    this.removeFirstImageContainer = function () {
        this.itemsContainer.removeChild(this.itemsContainer.firstChild);
    };

    /**
     * Remove last image with its container
     */
    this.removeLastImageContainer = function () {
        this.itemsContainer.removeChild(this.itemsContainer.lastChild);
    };

    /**
     * Toggle Listener on Scroll
     * @param {Boolean} on
     */
    this.toggleListenScroll = function (on) {
        if (on) {
            document.body.style.overflow = '';
        } else {
            document.body.style.overflow = 'hidden';
        }
    };
};